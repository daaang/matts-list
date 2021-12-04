/* global jest, describe, beforeEach, afterEach, test, expect */
import { render, screen, getByRole, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
// import { FetchMock } from '@react-mock/fetch'
import List from './List'

// Second pass: there are three ways I intend to mock the fetch API:
//
// 1.  Successful responses can just be a string response body.
// 2.  Responding with a non-2xx integer results in a bad response.
// 3.  A rejecting promise will cause fetch to reject with the error.
//
// Or in JSX:
//
//     <FetchMock
//       mocks={[
//         { matcher: /success/, response: 'body text' }
//         { matcher: /badstatus/, response: 404 }
//         { matcher: /badwithbody/, response: { status: 404, body: 'body' }
//         { matcher: /error/, response: async () => { throw AnyObject } }
//       ]}
//     >
//       <List />
//     </FetchMock>
//
// The format looks like this:
//
//     try {
//       const response = await fetch('...')
//       if (response.ok) {
//         const body = await response.text()
//         // Success: body is the response body string
//       } else {
//         // Bad status: response.status is a non-2xx integer
//       }
//     } catch(error) {
//       // Rejecting promise: error is the object it rejected with
//     }
//
// Tentatively, where I'm currently using localStorage to hold the list
// of items, I'll store two lists of items, one list of transformations,
// and a nanoid.
//
// When there are no transformations, the two lists are the same. Every
// 5 seconds, we send our nanoid to the api. If we're up to date, it
// responds with ok. If we're not, the api sends an up to date list and
// corresponding nanoid.
//
// All such requests will time out after 60 seconds (and they'll block
// other requests while waiting).
//
// When adding a transformation, the first step is to perform it on the
// active list, and the second step is to push it to the transformation
// array.
//
// Every 5 seconds, we look at the transformations. If there are none,
// we send the state id as usual. If there are any, we send the first
// one to the api along with the state id. If the api responds ok and
// with a new state id, then we shift out the first transformation,
// apply it to the backup list, set the new state id, and immediately
// prep the next fetch command (regardless of whether there are more
// transformations).
//
// If the api responds 5xx or times out, then we leave everything be and
// try again later (if 5xx, wait for the timeout before retrying). If
// the api responds 4xx, the basic scenario is that we shift it out of
// the transformations and regenerate the current item list (possibly
// modifying and/or removing some transformations on the way).
//
// That said, it's possible the server will give a specific reason for
// rejection, e.g. a colliding item id, in which case we can just
// generate a new id and try again.
//
// As I write the tests, I suppose every possible action can have a mock
// rejection for any conceivable reason, and I need to define how I
// expect the web client to behave.
//
// Once this is all written and working, I can move on to the actual API
// and database. And once the features are using them, then I can
// finally deploy them in reality. And then, finally, I can start
// working on more features.
//
// But also by the way, yeah, I think I'll go with kubernetes api
// versions. I feel like google knows what they're doing, and v1/v2/v3
// plus vXalphaY and vXbetaY seem pretty solid.

describe('a new List with nobody logged in', () => {
  beforeEach(() => {
    render(<List initItems={[]} />)
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
        userEvent.click(getButton(/done/i))
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
        userEvent.type(
          activeElement(),
          'wash dishes{enter}',
          { skipClick: true }
        )
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
          userEvent.type(
            activeElement(),
            'put clothes away{enter}',
            { skipClick: true }
          )
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

describe('a list with one item', () => {
  beforeEach(() => {
    render(
      <List initItems={['Wash Dishes']} />
    )
  })

  test('the item cannot be moved', () => {
    expect(getButton(/move up wash dishes/i)).toBeDisabled()
    expect(getButton(/move down wash dishes/i)).toBeDisabled()
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

  test('the top item cannot be moved up', () => {
    expect(getButton(/move up wash dishes/i)).toBeDisabled()
  })

  test('the bottom item cannot be moved down', () => {
    expect(getButton(/move down sweep floor/i)).toBeDisabled()
  })

  describe('when an item is completed', () => {
    beforeEach(() => {
      userEvent.click(getCheckbox(/fold clothes/i))
    })

    test('the item is complete instead of due', () => {
      expect(queryListItem(/fold clothes/i)).toBeComplete()
      expect(queryListItem(/fold clothes/i)).not.toBeDue()
    })

    describe('when the item is reopened', () => {
      beforeEach(() => {
        userEvent.click(getCheckbox(/fold clothes/i))
      })

      test('the item is due again', () => {
        expect(queryListItem(/fold clothes/i)).not.toBeComplete()
        expect(queryListItem(/fold clothes/i)).toBeDue()
      })
    })
  })

  describe('when an item is dismissed', () => {
    beforeEach(() => {
      userEvent.click(getButton(/dismiss sweep floor/i))
    })

    test('the item is no longer visible', () => {
      expect(queryListItem(/sweep floor/i)).toBeNull()
    })
  })

  describe('when the second item is moved up', () => {
    beforeEach(() => {
      userEvent.click(getButton(/move up fold clothes/i))
    })

    test('the second item is on top of the list', () => {
      expect(queryAllListItems()[0].name).toMatch(/fold clothes/i)
    })

    test('the top item is now second on the list', () => {
      expect(queryAllListItems()[1].name).toMatch(/wash dishes/i)
    })
  })

  describe('when the second item is moved down', () => {
    beforeEach(() => {
      userEvent.click(getButton(/move down fold clothes/i))
    })

    test('the second item is on the bottom of the list', () => {
      expect(queryAllListItems()[2].name).toMatch(/fold clothes/i)
    })

    test('the bottom item is now second from last', () => {
      expect(queryAllListItems()[1].name).toMatch(/sweep floor/i)
    })
  })

  describe('dragging items: [A, B, C]', () => {
    const itemA = /wash dishes/i
    const itemB = /fold clothes/i
    const itemC = /sweep floor/i

    test('all three items are draggable', () => {
      queryAllListItems().forEach(item => {
        expect(item.li).toHaveAttribute('draggable', 'true')
      })
    })

    describe('dragging A down by one', () => {
      beforeEach(() => {
        dragPath(queryListItem(itemA).li, [
          queryListItem(itemB).li
        ])
      })

      test('the order is [B, A, C]', () => {
        expect(queryAllListItems()[0].name).toMatch(itemB)
        expect(queryAllListItems()[1].name).toMatch(itemA)
        expect(queryAllListItems()[2].name).toMatch(itemC)
      })
    })

    describe('dragging A down to the bottom', () => {
      beforeEach(() => {
        dragPath(queryListItem(itemA).li, [
          queryListItem(itemB).li,
          queryListItem(itemC).li
        ])
      })

      test('the order is [B, C, A]', () => {
        expect(queryAllListItems()[0].name).toMatch(itemB)
        expect(queryAllListItems()[1].name).toMatch(itemC)
        expect(queryAllListItems()[2].name).toMatch(itemA)
      })
    })

    describe('dragging B up by one', () => {
      beforeEach(() => {
        dragPath(queryListItem(itemB).li, [
          queryListItem(itemA).li
        ])
      })

      test('the order is [B, A, C]', () => {
        expect(queryAllListItems()[0].name).toMatch(itemB)
        expect(queryAllListItems()[1].name).toMatch(itemA)
        expect(queryAllListItems()[2].name).toMatch(itemC)
      })
    })

    describe('dragging B down by one', () => {
      beforeEach(() => {
        dragPath(queryListItem(itemB).li, [
          queryListItem(itemC).li
        ])
      })

      test('the order is [A, C, B]', () => {
        expect(queryAllListItems()[0].name).toMatch(itemA)
        expect(queryAllListItems()[1].name).toMatch(itemC)
        expect(queryAllListItems()[2].name).toMatch(itemB)
      })
    })

    describe('dragging C up by one', () => {
      beforeEach(() => {
        dragPath(queryListItem(itemC).li, [
          queryListItem(itemB).li
        ])
      })

      test('the order is [A, C, B]', () => {
        expect(queryAllListItems()[0].name).toMatch(itemA)
        expect(queryAllListItems()[1].name).toMatch(itemC)
        expect(queryAllListItems()[2].name).toMatch(itemB)
      })
    })

    describe('dragging C up to the top', () => {
      beforeEach(() => {
        dragPath(queryListItem(itemC).li, [
          queryListItem(itemB).li,
          queryListItem(itemA).li
        ])
      })

      test('the order is [C, A, B]', () => {
        expect(queryAllListItems()[0].name).toMatch(itemC)
        expect(queryAllListItems()[1].name).toMatch(itemA)
        expect(queryAllListItems()[2].name).toMatch(itemB)
      })
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
      userEvent.click(getButton(/dismiss wash dishes/i))
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

describe('multiple renderings', () => {
  const world = {}
  world.render = x => { world.unmount = render(x).unmount }
  world.addItem = name => {
    userEvent.click(getButtonAddItem())
    userEvent.type(activeElement(), name + '{enter}')
  }

  world.users = [{
    id: '1',
    name: 'user 1',
    email: 'user1@xyz.net'
  }, {
    id: '2',
    name: 'user 2',
    email: 'user2@xyz.net'
  }]

  describe('a list with one item', () => {
    beforeEach(() => {
      world.render(<List />)
      screen.queryAllByRole('button', { name: /dismiss/i }).forEach(dismiss => {
        userEvent.click(dismiss)
      })
      world.addItem('wash dishes')
    })

    test('the item is on the list', () => {
      expect(queryListItem(/wash dishes/i)).toBeDue()
    })

    describe('after a reload', () => {
      beforeEach(() => {
        world.unmount()
        world.render(<List />)
      })

      test('the item is still on the list', () => {
        expect(queryListItem(/wash dishes/i)).toBeDue()
      })

      describe('when the item is dismissed', () => {
        beforeEach(() => {
          userEvent.click(getButton(/dismiss wash dishes/i))
        })

        test('the item is no longer on the list', () => {
          expect(queryListItem(/wash dishes/i)).toBeNull()
        })

        describe('after another reload', () => {
          beforeEach(() => {
            world.unmount()
            world.render(<List />)
          })

          test('the item is still not on the list', () => {
            expect(queryListItem(/wash dishes/i)).toBeNull()
          })
        })
      })
    })

    describe('after users A and B take turns logging in to add one item, then log out', () => {
      beforeEach(() => {
        world.unmount()
        world.render(<List user={world.users[0]} />)
        screen.queryAllByRole('button', { name: /dismiss/i }).forEach(dismiss => {
          userEvent.click(dismiss)
        })
        world.addItem('wipe counter')

        world.unmount()
        world.render(<List user={world.users[1]} />)
        screen.queryAllByRole('button', { name: /dismiss/i }).forEach(dismiss => {
          userEvent.click(dismiss)
        })
        world.addItem('polish doorknobs')

        world.unmount()
        world.render(<List />)
      })

      test('only the first item, belonging to nobody, is visible', () => {
        expect(queryListItem(/wash dishes/i)).toBeDue()
        expect(queryListItem(/wipe counter/i)).toBeNull()
        expect(queryListItem(/polish doorknobs/i)).toBeNull()
      })

      describe('when user A logs back in', () => {
        beforeEach(() => {
          world.unmount()
          world.render(<List user={world.users[0]} />)
        })

        test("only user A's item is visible", () => {
          expect(queryListItem(/wash dishes/i)).toBeNull()
          expect(queryListItem(/wipe counter/i)).toBeDue()
          expect(queryListItem(/polish doorknobs/i)).toBeNull()
        })

        describe('when user B logs back in', () => {
          beforeEach(() => {
            world.unmount()
            world.render(<List user={world.users[1]} />)
          })

          test("only user B's item is visible", () => {
            expect(queryListItem(/wash dishes/i)).toBeNull()
            expect(queryListItem(/wipe counter/i)).toBeNull()
            expect(queryListItem(/polish doorknobs/i)).toBeDue()
          })
        })
      })
    })
  })
})

/* global document */
const activeElement = () => { return document.activeElement || document.body }
const getButtonClear = () => screen.getByRole('button', { name: /clear/i })
const getButtonAddItem = () => screen.getByRole('button', { name: /add/i })
const getButtonReset = () => screen.getByRole('button', { name: /reset/i })
const getButton = name => screen.getByRole('button', { name: name })
const getCheckbox = name => screen.getByRole('checkbox', { name: name })
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

const queryAllListItems = () =>
  screen.getAllByRole('checkbox').map(checkbox => new ListItem(checkbox))

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

const dragPath = (item, path) => {
  const destination = path.pop()

  fireDragEvent(item, 'dragstart')
  for (let i = 0; i < 10; i++) {
    fireDragEvent(item, 'drag')
    fireDragEvent(item, 'dragover')
  }

  fireDragEvent(item, 'dragleave')
  for (let i = 0; i < 10; i++) {
    fireDragEvent(item, 'drag')
  }

  path.forEach(element => {
    fireDragEvent(element, 'dragenter')
    for (let i = 0; i < 10; i++) {
      fireDragEvent(item, 'drag')
      fireDragEvent(element, 'dragover')
    }

    fireDragEvent(element, 'dragleave')
    for (let i = 0; i < 10; i++) {
      fireDragEvent(item, 'drag')
    }
  })

  if (destination) {
    fireDragEvent(destination, 'dragenter')
    for (let i = 0; i < 10; i++) {
      fireDragEvent(item, 'drag')
      fireDragEvent(destination, 'dragover')
    }
    fireDragEvent(destination, 'drop')
  }

  fireDragEvent(item, 'dragend')
}

/* global MouseEvent */
const fireDragEvent = (item, type) => {
  fireEvent(item, new MouseEvent(type, {
    bubbles: true,
    cancelable: (type !== 'dragend' && type !== 'dragexit' && type !== 'dragleave'),
    composed: true
  }))
}
