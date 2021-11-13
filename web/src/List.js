import React from 'react'
import { nanoid } from 'nanoid'

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

class List extends React.Component {
  constructor (props) {
    super(props)
    const initItems = props.initItems || []
    const today = new Date()
    const resetTime = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ) + (24 * 60 * 60 * 1000)

    this.state = {
      newItemForm: '',
      currentTime: Date.now(),
      nextReset: resetTime,
      tickPeriod: this.props.tickPeriod || 5000,
      items: initItems.map(item => { return new AbstractItem(item) })
    }
  }

  componentDidMount () {
    this.tickInterval = setInterval(() => this.tick(), this.state.tickPeriod)
  }

  componentWillUnmount () {
    clearInterval(this.tickInterval)
  }

  tick () {
    if (this.state.nextReset < Date.now()) {
      this.setState({ nextReset: this.state.nextReset + (24 * 60 * 60 * 1000) })
      this.performReset()
    }

    this.setState({ currentTime: Date.now() })
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

  clearList () {
    this.setState({ items: [] })
  }

  changePhase (itemIndex, itemPhase) {
    const before = this.state.items.slice(0, itemIndex)
    const after = this.state.items.slice(itemIndex + 1)
    const item = this.state.items[itemIndex].copyItem({ phase: itemPhase })

    this.setState({ items: before.concat([item]).concat(after) })
  }

  dismissItem (itemIndex) {
    const before = this.state.items.slice(0, itemIndex)
    const after = this.state.items.slice(itemIndex + 1)
    const item = this.state.items[itemIndex].copyItem({ dismissed: true })

    this.setState({ items: before.concat([item]).concat(after) })
  }

  moveUpItem (itemIndex) {
    const before = this.state.items.slice(0, itemIndex)
    const after = this.state.items.slice(itemIndex + 1)
    const item = this.state.items[itemIndex]

    after.unshift(before.pop())
    before.push(item)
    this.setState({ items: before.concat(after) })
  }

  moveDownItem (itemIndex) {
    const before = this.state.items.slice(0, itemIndex)
    const after = this.state.items.slice(itemIndex + 1)
    const item = this.state.items[itemIndex]

    before.push(after.shift())
    before.push(item)
    this.setState({ items: before.concat(after) })
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
    if (itemIndex < this.state.draggingItem) {
      const before = this.state.items.slice(0, itemIndex)
      const after = this.state.items.slice(itemIndex, this.state.draggingItem)
      const last = this.state.items.slice(this.state.draggingItem + 1)

      before.push(this.state.items[this.state.draggingItem])
      this.setState({
        items: before.concat(after).concat(last),
        draggingItem: itemIndex
      })
    } else {
      const first = this.state.items.slice(0, this.state.draggingItem)
      const before = this.state.items.slice(this.state.draggingItem + 1, itemIndex + 1)
      const after = this.state.items.slice(itemIndex + 1)

      before.push(this.state.items[this.state.draggingItem])
      this.setState({
        items: first.concat(before).concat(after),
        draggingItem: itemIndex
      })
    }
  }

  stopDraggingItem (itemIndex, event) {
    this.setState({ draggingItem: undefined })
  }

  render () {
    return (
      <>
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
                onChange={phase => this.changePhase(index, phase)}
                onDismiss={() => this.dismissItem(index)}
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

export default List
