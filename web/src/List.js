import React from 'react'
import { nanoid } from 'nanoid'

class List extends React.Component {
  constructor (props) {
    super(props)

    this.localKey = (props.user) ? 'items-' + props.user.id : 'items'

    const initItems = () => {
      if (props.initItems) return props.initItems

      const localItems = JSON.parse(window.localStorage.getItem(this.localKey))
      if (localItems) return localItems
      return []
    }

    this.state = {
      newItemForm: '',
      items: initItems().map(item => { return new AbstractItem(item) })
    }
  }

  setItems (cb) {
    const items = cb(this.state.items.slice())
    window.localStorage.setItem(this.localKey, JSON.stringify(items))
    this.setState({ items })
  }

  clearList () {
    this.setItems(() => [])
  }

  performReset () {
    this.setItems(items => items
      .filter(item => item.phase === 'due')
      .map(item => item.copyItem({ dismissed: false })))
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
      this.setItems(items => items.concat([new AbstractItem(itemName)]))
    }
  }

  changeItem (itemIndex, override) {
    this.setItems(items => {
      return items.slice(0, itemIndex)
        .concat([items[itemIndex].copyItem(override)])
        .concat(items.slice(itemIndex + 1))
    })
  }

  itemPosition (itemIndex) {
    if (this.state.items.length === 1) return 'only'
    else if (itemIndex === 0) return 'top'
    else if (itemIndex === this.state.items.length - 1) return 'bottom'
    else return 'middle'
  }

  startDraggingItem (itemIndex) {
    this.setState({ draggingItem: itemIndex })
  }

  stopDraggingItem (itemIndex) {
    this.setState({ draggingItem: undefined })
  }

  dragOverItem (itemIndex) {
    const draggingItem = this.state.draggingItem
    this.setItems(items => this.reorderItems(items, draggingItem, itemIndex))
    this.setState({ draggingItem: itemIndex })
  }

  moveItem (itemIndex, desiredIndex) {
    this.setItems(items => this.reorderItems(items, itemIndex, desiredIndex))
  }

  reorderItems (items, itemIndex, desiredIndex) {
    const [min, max] = [itemIndex, desiredIndex].sort()

    const before = items.slice(0, min)
    const middle = items.slice(min, max + 1)
    const after = items.slice(max + 1)

    if (itemIndex < desiredIndex) {
      middle.push(middle.shift())
    } else {
      middle.unshift(middle.pop())
    }

    return before.concat(middle).concat(after)
  }

  render () {
    return (
      <>
        <DailyReset
          performReset={() => this.performReset()}
          tickPeriod={this.props.tickPeriod || 5000}
        />
        <ol>
          {this.state.items.map((item, index) => (
            <ListItem
              key={item.id}
              item={item}
              position={this.itemPosition(index)}
              isDragging={index === this.state.draggingItem}
              onChange={phase => this.changeItem(index, { phase: phase })}
              onDismiss={() => this.changeItem(index, { dismissed: true })}
              onMoveUp={() => this.moveItem(index, index - 1)}
              onMoveDown={() => this.moveItem(index, index + 1)}
              onDragStart={() => this.startDraggingItem(index)}
              onDragEnter={() => this.dragOverItem(index)}
              onDragEnd={() => this.stopDraggingItem(index)}
            />
          ))}
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

  if (props.item.phase === 'complete') {
    classNames.push('item-complete')
  } else {
    classNames.push('item-due')
  }

  const buttons = [{
    glyph: '↑',
    label: 'Move up %s',
    disabled: props.position === 'top' || props.position === 'only',
    fn: props.onMoveUp
  }, {
    glyph: '↓',
    label: 'Move down %s',
    disabled: props.position === 'bottom' || props.position === 'only',
    fn: props.onMoveDown
  }, {
    glyph: '×',
    label: 'Dismiss %s until tomorrow',
    disabled: false,
    fn: props.onDismiss
  }]

  return (
    <li
      className={classNames.join(' ')}
      aria-hidden={props.item.dismissed}
      draggable='true'
      onDragStart={() => props.onDragStart()}
      onDragEnter={() => props.onDragEnter()}
      onDragEnd={() => props.onDragEnd()}
      onDragOver={onDragOver}
      onDrop={() => null}
    >
      <input
        id={props.item.id}
        type='checkbox'
        checked={props.item.phase === 'complete'}
        onChange={event => props.onChange(event.target.checked ? 'complete' : 'due')}
      />
      <div className='item-buttons'>
        {buttons.map(button => (
          <button
            key={button.label.replace(' %s', '')}
            title={button.label.replace(' %s', '')}
            aria-label={button.label.replace('%s', props.item.name)}
            disabled={button.disabled}
            onClick={() => button.fn()}
          >
            {button.glyph}
          </button>
        ))}
      </div>
      <label htmlFor={props.item.id}>{props.item.name}</label>
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
