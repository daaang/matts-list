import React from 'react'

class List extends React.Component {
  constructor (props) {
    super(props)
    const initItems = props.initItems || []
    this.state = {
      newItemForm: '',
      items: initItems.slice()
    }
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
      this.setState({ items: items.concat([value]) })
    }
  }

  clearList () {
    this.setState({ items: [] })
  }

  render () {
    return (
      <>
        <ol>
          {this.state.items.map((item, index) => (
            <Item key={index} id={'item-' + index} name={item} />
          ))}
        </ol>
        {this.state.newItemForm}
        <button type='button' onClick={() => this.clearList()}>Clear list</button>
        <button type='button' onClick={() => this.startAddingItem()}>Add item</button>
      </>
    )
  }
}

class Item extends React.Component {
  constructor (props) {
    super(props)
    this.checkboxRef = React.createRef()
    this.state = {
      cssClass: 'item-due'
    }
  }

  componentDidMount () {
    this.matchClassToCheckbox()
  }

  matchClassToCheckbox () {
    if (this.checkboxRef.current.checked) {
      this.setState({ cssClass: 'item-complete' })
    } else {
      this.setState({ cssClass: 'item-due' })
    }
  }

  render () {
    return (
      <li className={this.state.cssClass}>
        <input
          id={this.props.id}
          type='checkbox'
          ref={this.checkboxRef}
          onChange={() => this.matchClassToCheckbox()}
        />
        <label htmlFor={this.props.id}>{this.props.name}</label>
      </li>
    )
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

export default List
