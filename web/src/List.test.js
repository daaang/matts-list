/* global jest, describe, beforeEach, afterEach, test, expect */
import { render, screen, getByRole } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import List from './List'

describe('a new List', () => {
  beforeEach(() => {
    render(<List />)
  })

  test('renders no text fields for adding new items', () => {
    expect(queryInputNewItem()).toBeNull()
  })

  describe('when the add item button has been clicked', () => {
    beforeEach(() => {
      userEvent.click(getButtonAddItem())
    })

    test('a new item field has focus', () => {
      expect(queryInputNewItem()).toHaveFocus()
    })

    describe('when the empty new item form is submitted', () => {
      beforeEach(() => {
        userEvent.click(screen.getByRole('button', { name: /done/i }))
      })

      test('the new item field is no longer present', () => {
        expect(queryInputNewItem()).toBeNull()
      })

      test('no items have been added to the list', () => {
        expect(screen.queryByRole('listitem')).toBeNull()
      })
    })

    describe('when "wash dishes" has been typed in', () => {
      beforeEach(() => {
        expect(queryListItem(/wash dishes/i)).toBeNull()
        userEvent.type(activeElement(), 'wash dishes{enter}', { skipClick: true })
      })

      test('an item called "wash dishes" is due', () => {
        expect(queryListItem(/wash dishes/i)).toBeDue()
      })

      test('the new item field is no longer present', () => {
        expect(queryInputNewItem()).toBeNull()
      })

      describe('when I add a second item', () => {
        beforeEach(() => {
          userEvent.click(getButtonAddItem())
          expect(queryListItem(/put clothes away/i)).toBeNull()
          userEvent.type(activeElement(), 'put clothes away{enter}', { skipClick: true })
        })

        test('the new item is due', () => {
          expect(queryListItem(/put clothes away/i)).toBeDue()
        })

        test('the "wash dishes" item is still due', () => {
          expect(queryListItem(/wash dishes/i)).toBeDue()
        })

        describe('when the clear list button has been clicked', () => {
          beforeEach(() => {
            userEvent.click(getButtonClear())
          })

          test('both items are no longer visible', () => {
            expect(queryListItem(/put clothes away/i)).toBeNull()
            expect(queryListItem(/wash dishes/i)).toBeNull()
          })
        })
      })
    })
  })
})

describe('a list with three items', () => {
  beforeEach(() => {
    render(
      <List initItems={['Wash Dishes', 'Fold Clothes', 'Sweep Floor']} />
    )
  })

  test('shows all three items as due', () => {
    expect(queryListItem(/wash dishes/i)).toBeDue()
    expect(queryListItem(/fold clothes/i)).toBeDue()
    expect(queryListItem(/sweep floor/i)).toBeDue()
  })

  describe('when an item is completed', () => {
    beforeEach(() => {
      userEvent.click(screen.getByRole('checkbox', { name: /fold clothes/i }))
    })

    test('the item is complete instead of due', () => {
      expect(queryListItem(/fold clothes/i)).toBeComplete()
      expect(queryListItem(/fold clothes/i)).not.toBeDue()
    })

    describe('when the item is reopened', () => {
      beforeEach(() => {
        userEvent.click(screen.getByRole('checkbox', { name: /fold clothes/i }))
      })

      test('the item is due again', () => {
        expect(queryListItem(/fold clothes/i)).not.toBeComplete()
        expect(queryListItem(/fold clothes/i)).toBeDue()
      })
    })
  })

  describe('when an item is dismissed', () => {
    beforeEach(() => {
      userEvent.click(screen.getByRole('button', { name: /dismiss sweep floor/i }))
    })

    test('the item is no longer visible', () => {
      expect(queryListItem(/sweep floor/i)).toBeNull()
    })
  })
})

describe('a list with a complete item and a dismissed item', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern')
    render(
      <List
        tickPeriod={10 * 60 * 1000}
        initItems={[
          { name: 'Wash Dishes', phase: 'complete' },
          { name: 'Fold Clothes', phase: 'due', dismissed: 'true' },
          'Sweep Floor'
        ]}
      />
    )
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('the complete item is visible and complete', () => {
    expect(queryListItem(/wash dishes/i)).toBeComplete()
  })

  test('the dismissed item is not visible', () => {
    expect(queryListItem(/fold clothes/i)).toBeNull()
  })

  describe('after a day passes', () => {
    beforeEach(() => {
      jest.advanceTimersByTime(24 * 60 * 60 * 1000)
    })

    test('the complete item is no longer on the list', () => {
      expect(queryListItem(/wash dishes/i)).toBeNull()
    })

    test('the dismissed item is back on the list', () => {
      expect(queryListItem(/fold clothes/i)).toBeDue()
    })

    test('any due items are still on the list', () => {
      expect(queryListItem(/sweep floor/i)).toBeDue()
    })
  })

  describe('when the complete item is dismissed', () => {
    beforeEach(() => {
      userEvent.click(screen.getByRole('button', { name: /dismiss wash dishes/i }))
    })

    test('the complete item is no longer on the list', () => {
      expect(queryListItem(/wash dishes/i)).toBeNull()
    })

    describe('after a day passes', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(24 * 60 * 60 * 1000)
      })

      test('the complete item is still not on the list', () => {
        expect(queryListItem(/wash dishes/i)).toBeNull()
      })
    })
  })

  describe('when the reset button is pressed', () => {
    beforeEach(() => {
      userEvent.click(getButtonReset())
    })

    test('the complete item is no longer on the list', () => {
      expect(queryListItem(/wash dishes/i)).toBeNull()
    })

    test('the dismissed item is back on the list', () => {
      expect(queryListItem(/fold clothes/i)).toBeDue()
    })

    test('any due items are still on the list', () => {
      expect(queryListItem(/sweep floor/i)).toBeDue()
    })
  })
})

/* global document */
const activeElement = () => { return document.activeElement || document.body }
const getButtonClear = () => screen.getByRole('button', { name: /clear/i })
const getButtonAddItem = () => screen.getByRole('button', { name: /add/i })
const getButtonReset = () => screen.getByRole('button', { name: /reset/i })
const queryInputNewItem = () => screen.queryByRole('textbox', { name: /new item/i })

const getChildElement = (element, tagName) =>
  Array.from(element.children).find(element => element.tagName === tagName.toUpperCase())

const queryListItem = name => {
  const checkbox = screen.queryByRole('checkbox', { name: name })
  if (checkbox) {
    return new ListItem(checkbox)
  } else {
    return checkbox
  }
}

expect.extend({
  toBeComplete (received) {
    return expectListItemPhase(received, 'complete')
  },

  toBeDue (received) {
    return expectListItemPhase(received, 'due')
  }
})

const expectListItemPhase = (item, phase) => {
  if (!item) {
    return {
      pass: false,
      message: () => `expected ${item} to be a list item`
    }
  }

  if (item.phase === phase) {
    return {
      pass: true,
      message: () => `expected ${JSON.stringify(item)} not to be ${phase}`
    }
  } else {
    return {
      pass: false,
      message: () => `expected ${JSON.stringify(item)} to be ${phase}`
    }
  }
}

class ListItem {
  constructor (checkbox) {
    this.li = checkbox.parentNode
  }

  get name () {
    return getChildElement(this.li, 'label').textContent
  }

  get phase () {
    if (getByRole(this.li, 'checkbox').checked) {
      return 'complete'
    } else if (this.li.classList.contains('item-due')) {
      return 'due'
    } else {
      return 'unknown'
    }
  }

  toJSON () {
    return {
      name: this.name,
      phase: this.phase
    }
  }
}
