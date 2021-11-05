import React from 'react'

class List extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      addingNewItem: false,
      items: []
    }
    this.newItemRef = React.createRef()
  }

  addItem () {
    this.setState({
      addingNewItem: true
    })
  }

  componentDidUpdate () {
    if (this.newItemRef.current !== null) {
      this.newItemRef.current.focus()
    }
  }

  handleSubmitNewItem () {
    const items = this.state.items.slice()
    this.setState({
      addingNewItem: false,
      items: items.concat([this.newItemRef.current.value])
    })
  }

  clearList () {
    this.setState({ items: [] })
  }

  render () {
    const addItemForm = (
      <form onSubmit={() => this.handleSubmitNewItem()}>
        <input
          type='text'
          placeholder='New item...'
          ref={this.newItemRef}
        />
        <button type='submit'>Add</button>
      </form>
    )

    return (
      <div>
        <ol>
          {this.state.items.map((item, index) => (
            <li className='item-due' key={index}>{item}</li>
          ))}
        </ol>
        <div id='new-item-area'>{this.state.addingNewItem ? addItemForm : ''}</div>
        <button type='button' onClick={() => this.clearList()}>Clear list</button>
        <button type='button' onClick={() => this.addItem()}>Add item</button>
      </div>
    )
  }
}

export default List
