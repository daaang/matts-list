import React from 'react'

class List extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      newItemForm: '',
      items: []
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
    const items = this.state.items.slice()
    this.setState({
      newItemForm: '',
      items: items.concat([value])
    })
  }

  clearList () {
    this.setState({ items: [] })
  }

  render () {
    return (
      <>
        <ol>
          {this.state.items.map((item, index) => (
            <li className='item-due' key={index}>{item}</li>
          ))}
        </ol>
        {this.state.newItemForm}
        <button type='button' onClick={() => this.clearList()}>Clear list</button>
        <button type='button' onClick={() => this.startAddingItem()}>Add item</button>
      </>
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

  handleSubmit () {
    this.props.onSubmit(this.textboxRef.current.value)
  }

  render () {
    return (
      <form onSubmit={() => this.handleSubmit()}>
        <label htmlFor='auto-focus-textbox'>{this.props.labelText}</label>
        <input id='auto-focus-textbox' type='text' ref={this.textboxRef} />
        <input type='submit' value='Done' />
      </form>
    )
  }
}

export default List
