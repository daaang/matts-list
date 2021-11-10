import React from 'react'

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
      items: initItems.map(i => {
        if (typeof i === 'string') {
          return { name: i, phase: 'due' }
        } else {
          return i
        }
      })
    }
  }

  componentDidMount () {
    this.tick()
  }

  tick () {
    if (this.state.nextReset < Date.now()) {
      this.setState({ nextReset: this.state.nextReset + (24 * 60 * 60 * 1000) })
      this.performReset()
    }

    this.setState({ currentTime: Date.now() })
    setTimeout(() => this.tick(), this.state.tickPeriod)
  }

  performReset () {
    this.setState({ items: this.state.items.filter(i => i.phase === 'due') })
  }

  startAddingItem () {
    this.setState({
      newItemForm: (
        <AutoFocusTextForm
          labelText='New item'
          onSubmit={item => this.doneAddingItem(item)}
        />
      )
    })
  }

  doneAddingItem (value) {
    this.setState({ newItemForm: '' })
    if (value) {
      const items = this.state.items.slice()
      this.setState({ items: items.concat([{ name: value, phase: 'due' }]) })
    }
  }

  clearList () {
    this.setState({ items: [] })
  }

  changePhase (itemIndex, itemPhase) {
    const before = this.state.items.slice(0, itemIndex)
    const after = this.state.items.slice(itemIndex + 1)
    const item = {
      name: this.state.items[itemIndex].name,
      phase: itemPhase
    }

    this.setState({ items: before.concat([item]).concat(after) })
  }

  render () {
    return (
      <>
        <ol>
          {this.state.items.map((item, index) => (
            <Item
              key={index}
              id={'item-' + index}
              name={item.name}
              phase={item.phase}
              onChange={phase => this.changePhase(index, phase)}
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

function Item (props) {
  return (
    <li className={(props.phase === 'complete') ? 'item-complete' : 'item-due'}>
      <input
        id={props.id}
        type='checkbox'
        checked={props.phase === 'complete'}
        onChange={event => props.onChange(event.target.checked ? 'complete' : 'due')}
      />
      <label htmlFor={props.id}>{props.name}</label>
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
