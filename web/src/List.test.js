/* global describe, beforeEach, afterEach, test, expect */
import { render, screen, getByRole, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FakeTimers from '@sinonjs/fake-timers'
import { act } from 'react-dom/test-utils'
import List from './List'

describe('multiple renderings', () => {
  const world = {}
  world.render = x => { world.unmount = render(x).unmount }
  world.addItem = async name => {
    await userEvent.default.click(getButtonAddItem())
    await userEvent.default.type(activeElement(), name + '{enter}')
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

  test('maintains state between renders', async () => {
    world.render(<List />)
    await world.addItem('wash dishes')
    expect(queryListItem(/wash dishes/i)).toBeDue()

    world.unmount()
    world.render(<List />)
    expect(queryListItem(/wash dishes/i)).toBeDue()
    await userEvent.default.click(getButton(/dismiss wash dishes/i))
    expect(queryListItem(/wash dishes/i)).toBeNull()
  })

  test('maintains different lists for different users', async () => {
    world.render(<List />)
    await world.addItem('wash dishes')

    world.unmount()
    world.render(<List user={world.users[0]} />)
    await world.addItem('wipe counter')

    world.unmount()
    world.render(<List user={world.users[1]} />)
    await world.addItem('polish doorknobs')

    world.unmount()
    world.render(<List />)
    expect(queryListItem(/wash dishes/i)).toBeDue()
    expect(queryListItem(/wipe counter/i)).toBeNull()
    expect(queryListItem(/polish doorknobs/i)).toBeNull()

    world.unmount()
    world.render(<List user={world.users[0]} />)
    expect(queryListItem(/wash dishes/i)).toBeNull()
    expect(queryListItem(/wipe counter/i)).toBeDue()
    expect(queryListItem(/polish doorknobs/i)).toBeNull()

    world.unmount()
    world.render(<List user={world.users[1]} />)
    expect(queryListItem(/wash dishes/i)).toBeNull()
    expect(queryListItem(/wipe counter/i)).toBeNull()
    expect(queryListItem(/polish doorknobs/i)).toBeDue()
  })
})

describe('a new List', () => {
  beforeEach(() => {
    render(<List initItems={[]} />)
  })

  test('renders no text fields for adding new items', () => {
    expect(queryInputNewItem()).toBeNull()
  })

  describe('when the add item button has been clicked', () => {
    beforeEach(async () => {
      await userEvent.default.click(getButtonAddItem())
    })

    test('a new item field has focus', () => {
      expect(queryInputNewItem()).toHaveFocus()
    })

    describe('when the empty new item form is submitted', () => {
      beforeEach(async () => {
        await userEvent.default.click(getButton(/done/i))
      })

      test('the new item field is no longer present', () => {
        expect(queryInputNewItem()).toBeNull()
      })

      test('no items have been added to the list', () => {
        expect(screen.queryByRole('listitem')).toBeNull()
      })
    })

    describe('when "wash dishes" has been typed in', () => {
      beforeEach(async () => {
        expect(queryListItem(/wash dishes/i)).toBeNull()
        await userEvent.default.type(
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
        beforeEach(async () => {
          await userEvent.default.click(getButtonAddItem())
          expect(queryListItem(/put clothes away/i)).toBeNull()
          await userEvent.default.type(
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
          beforeEach(async () => {
            await userEvent.default.click(getButtonClear())
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
    beforeEach(async () => {
      await userEvent.default.click(getCheckbox(/fold clothes/i))
    })

    test('the item is complete instead of due', () => {
      expect(queryListItem(/fold clothes/i)).toBeComplete()
      expect(queryListItem(/fold clothes/i)).not.toBeDue()
    })

    describe('when the item is reopened', () => {
      beforeEach(async () => {
        await userEvent.default.click(getCheckbox(/fold clothes/i))
      })

      test('the item is due again', () => {
        expect(queryListItem(/fold clothes/i)).not.toBeComplete()
        expect(queryListItem(/fold clothes/i)).toBeDue()
      })
    })
  })

  describe('when an item is dismissed', () => {
    beforeEach(async () => {
      await userEvent.default.click(getButton(/dismiss sweep floor/i))
    })

    test('the item is no longer visible', () => {
      expect(queryListItem(/sweep floor/i)).toBeNull()
    })
  })

  describe('when the second item is moved up', () => {
    beforeEach(async () => {
      await userEvent.default.click(getButton(/move up fold clothes/i))
    })

    test('the second item is on top of the list', () => {
      expect(queryAllListItems()[0].name).toMatch(/fold clothes/i)
    })

    test('the top item is now second on the list', () => {
      expect(queryAllListItems()[1].name).toMatch(/wash dishes/i)
    })
  })

  describe('when the second item is moved down', () => {
    beforeEach(async () => {
      await userEvent.default.click(getButton(/move down fold clothes/i))
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
  let clock = null
  const awaitAsyncEvent = fn => () => new Promise(resolve => {
    Promise.all([fn(), clock.tickAsync(1000)]).then(values => {
      resolve(values)
    })
  })

  beforeEach(() => {
    const now = Date.now()
    clock = FakeTimers.install({ now })
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
    clock.uninstall()
  })

  test('the complete item is visible and complete', () => {
    expect(queryListItem(/wash dishes/i)).toBeComplete()
  })

  test('the dismissed item is not visible', () => {
    expect(queryListItem(/fold clothes/i)).toBeNull()
  })

  describe('after a day passes', () => {
    beforeEach(async () => {
      await act(async () => {
        await clock.tickAsync(24 * 60 * 60 * 1000)
      })
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
    beforeEach(awaitAsyncEvent(() =>
      userEvent.default.click(getButton(/dismiss wash dishes/i))))

    test('the complete item is no longer on the list', () => {
      expect(queryListItem(/wash dishes/i)).toBeNull()
    })

    describe('after a day passes', () => {
      beforeEach(async () => {
        await act(async () => {
          await clock.tickAsync(24 * 60 * 60 * 1000)
        })
      })

      test('the complete item is still not on the list', () => {
        expect(queryListItem(/wash dishes/i)).toBeNull()
      })
    })
  })

  describe('when the reset button is pressed', () => {
    beforeEach(awaitAsyncEvent(() =>
      userEvent.default.click(getButtonReset())))

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
const getButton = name => screen.getByRole('button', { name })
const getCheckbox = name => screen.getByRole('checkbox', { name })
const queryInputNewItem = () => screen.queryByRole('textbox', { name: /new item/i })

const getChildElement = (element, tagName) =>
  Array.from(element.children).find(element => element.tagName === tagName.toUpperCase())

const queryListItem = name => {
  const checkbox = screen.queryByRole('checkbox', { name })
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
