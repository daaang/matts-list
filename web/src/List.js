import React from 'react'
import { nanoid } from 'nanoid'

class List extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      newItemForm: '',
      items: (props.initItems)
        ? props.initItems.map(item => { return new AbstractItem(item) })
        : []
    }
  }

  clearList () {
    this.setState({ items: [] })
  }

  performReset () {
    this.setState({
      items: this.state.items
        .filter(item => item.phase === 'due')
        .map(item => item.copyItem({ dismissed: false }))
    })
  }

  startAddingItem () {
    this.setState({
      newItemForm: (
        <AutoFocusTextForm
          labelText='New item'
          onSubmit={itemName => this.doneAddingItem(itemName)}
        />
      )
    })
  }

  doneAddingItem (itemName) {
    this.setState({ newItemForm: '' })

    if (itemName) {
      const items = this.state.items.slice()
      items.push(new AbstractItem(itemName))
      this.setState({ items: items })
    }
  }

  changeItem (itemIndex, override) {
    const before = this.state.items.slice(0, itemIndex)
    const after = this.state.items.slice(itemIndex + 1)

    before.push(this.state.items[itemIndex].copyItem(override))
    this.setState({ items: before.concat(after) })
  }

  moveUpItem (itemIndex) {
    this.setState({ items: this.moveItem(itemIndex, itemIndex - 1) })
  }

  moveDownItem (itemIndex) {
    this.setState({ items: this.moveItem(itemIndex, itemIndex + 1) })
  }

  itemPosition (itemIndex) {
    if (this.state.items.length === 1) return 'only'
    else if (itemIndex === 0) return 'top'
    else if (itemIndex === this.state.items.length - 1) return 'bottom'
    else return 'middle'
  }

  startDraggingItem (itemIndex, event) {
    this.setState({ draggingItem: itemIndex })
  }

  dragOverItem (itemIndex, event) {
    this.setState({
      items: this.moveItem(this.state.draggingItem, itemIndex),
      draggingItem: itemIndex
    })
  }

  stopDraggingItem (itemIndex, event) {
    this.setState({ draggingItem: undefined })
  }

  moveItem (itemIndex, desiredIndex) {
    return this.reorderItems(itemIndex, desiredIndex, middle => {
      if (itemIndex < desiredIndex) {
        middle.push(middle.shift())
      } else {
        middle.unshift(middle.pop())
      }
      return middle
    })
  }

  reorderItems (index1, index2, cb) {
    const [min, max] = [index1, index2].sort()

    const before = this.state.items.slice(0, min)
    const middle = this.state.items.slice(min, max + 1)
    const after = this.state.items.slice(max + 1)

    return before.concat(cb(middle)).concat(after)
  }

  render () {
    return (
      <>
        <DailyReset
          performReset={() => this.performReset()}
          tickPeriod={this.props.tickPeriod || 5000}
        />
        <ol>
          {this.state.items.map((item, index) => {
            return (
              <ListItem
                key={item.id}
                id={'item-' + index}
                phase={item.phase}
                dismissed={item.dismissed}
                position={this.itemPosition(index)}
                isDragging={index === this.state.draggingItem}
                onChange={phase => this.changeItem(index, { phase: phase })}
                onDismiss={() => this.changeItem(index, { dismissed: true })}
                onMoveUp={() => this.moveUpItem(index)}
                onMoveDown={() => this.moveDownItem(index)}
                onDragStart={event => this.startDraggingItem(index, event)}
                onDragEnter={event => this.dragOverItem(index, event)}
                onDragEnd={event => this.stopDraggingItem(index, event)}
              >
                {item.name}
              </ListItem>
            )
          })}
        </ol>
        {this.state.newItemForm}
        <button type='button' onClick={() => this.startAddingItem()}>Add item</button>
        <hr />
        <p>These buttons are only here for testing purposes.</p>
        <button type='button' onClick={() => this.performReset()}>Daily reset</button>
        <button type='button' onClick={() => this.clearList()}>Clear list</button>
      </>
    )
  }
}

function ListItem (props) {
  const classNames = []

  if (props.isDragging) classNames.push('item-dragging')
  const onDragOver = (props.isDragging)
    ? event => { event.preventDefault() }
    : () => null

  if (props.phase === 'complete') {
    classNames.push('item-complete')
  } else {
    classNames.push('item-due')
  }

  return (
    <li
      className={classNames.join(' ')}
      aria-hidden={props.dismissed}
      draggable='true'
      onDragStart={event => props.onDragStart(event)}
      onDragEnter={event => props.onDragEnter(event)}
      onDragEnd={event => props.onDragEnd(event)}
      onDragOver={onDragOver}
      onDrop={() => null}
    >
      <input
        id={props.id}
        type='checkbox'
        checked={props.phase === 'complete'}
        onChange={event => props.onChange(event.target.checked ? 'complete' : 'due')}
      />
      <div className='item-buttons'>
        <button
          aria-label={'Move up ' + props.children}
          title='Move up'
          disabled={props.position === 'top' || props.position === 'only'}
          onClick={() => props.onMoveUp()}
        >
          ↑
        </button>
        <button
          aria-label={'Move down ' + props.children}
          title='Move down'
          disabled={props.position === 'bottom' || props.position === 'only'}
          onClick={() => props.onMoveDown()}
        >
          ↓
        </button>
        <button
          aria-label={'Dismiss ' + props.children + ' until tomorrow'}
          title='Dismiss until tomorrow'
          onClick={() => props.onDismiss()}
        >
          ×
        </button>
      </div>
      <label htmlFor={props.id}>{props.children}</label>
    </li>
  )
}

class DailyReset extends React.Component {
  constructor (props) {
    super(props)

    this.state = { nextReset: this.getUpcomingMidnight() }
  }

  componentDidMount () {
    this.tickInterval = setInterval(() => this.tick(), this.props.tickPeriod)
  }

  componentWillUnmount () {
    clearInterval(this.tickInterval)
  }

  render () {
    return null
  }

  getUpcomingMidnight () {
    const today = new Date()
    return Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ) + (24 * 60 * 60 * 1000)
  }

  tick () {
    if (this.isTimeToReset()) {
      this.setState({ nextReset: this.resetAfterNext() })
      this.props.performReset()
    }

    this.setState({ currentTime: Date.now() })
  }

  isTimeToReset () {
    return this.state.nextReset < Date.now()
  }

  resetAfterNext () {
    return this.state.nextReset + (24 * 60 * 60 * 1000)
  }
}

class AutoFocusTextForm extends React.Component {
  constructor (props) {
    super(props)
    this.textboxRef = React.createRef()
  }

  componentDidMount () {
    this.textboxRef.current.focus()
  }

  handleSubmit (e) {
    e.preventDefault()
    this.props.onSubmit(this.textboxRef.current.value)
  }

  render () {
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <label htmlFor='auto-focus-textbox'>{this.props.labelText}</label>
        <input id='auto-focus-textbox' type='text' ref={this.textboxRef} />
        <input type='submit' value='Done' />
      </form>
    )
  }
}

class AbstractItem {
  constructor (init) {
    const obj = (typeof init === 'string')
      ? { name: init }
      : init

    this.id = obj.id || nanoid()
    this.name = obj.name
    this.phase = obj.phase || 'due'
    this.dismissed = obj.dismissed || false
  }

  copyItem (override) {
    return new AbstractItem({
      id: this.id,
      name: this.name,
      phase: (typeof override.phase === 'undefined')
        ? this.phase
        : override.phase,
      dismissed: (typeof override.dismissed === 'undefined')
        ? this.dismissed
        : override.dismissed
    })
  }
}

export default List
