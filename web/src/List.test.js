/* global describe, beforeEach, test, expect, document */
/* global HTMLButtonElement */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import List from './List'

const getFocusedElement = () => { return document.activeElement || document.body }
const getClearButton = () => screen.getByText(/clear list/i)
const getAddItemButton = () => screen.getByText(/add item/i)
const getNewItemField = () => screen.getByPlaceholderText(/new item/i)
const queryNewItemField = () => screen.queryByPlaceholderText(/new item/i)

describe('a new List', () => {
  beforeEach(() => {
    render(<List />)
  })

  test('renders "clear list" button', () => {
    expect(getClearButton()).toBeInstanceOf(HTMLButtonElement)
  })

  test('renders "add item" button', () => {
    expect(getAddItemButton()).toBeInstanceOf(HTMLButtonElement)
  })

  test('renders no text fields for new items', () => {
    expect(queryNewItemField()).toBeNull()
  })

  describe('when the add item button has been clicked', () => {
    beforeEach(() => {
      userEvent.click(getAddItemButton())
    })

    test('a new item field has focus', () => {
      expect(getNewItemField()).toHaveFocus()
    })

    describe('when "wash dishes" has been typed in', () => {
      beforeEach(() => {
        expect(screen.queryByText(/wash dishes/i)).toBeNull()
        userEvent.type(getFocusedElement(), 'wash dishes{enter}', { skipClick: true })
      })

      test('an item called "wash dishes" is due', () => {
        expect(screen.getByText(/wash dishes/i)).toHaveClass('item-due')
      })

      test('the new item field is no longer present', () => {
        expect(queryNewItemField()).toBeNull()
      })

      describe('when I add a second item', () => {
        beforeEach(() => {
          userEvent.click(getAddItemButton())
          expect(screen.queryByText(/put clothes away/i)).toBeNull()
          userEvent.type(getFocusedElement(), 'put clothes away{enter}', { skipClick: true })
        })

        test('the new item is due', () => {
          expect(screen.getByText(/put clothes away/i)).toHaveClass('item-due')
        })

        test('the "wash dishes" item is still due', () => {
          expect(screen.getByText(/wash dishes/i)).toHaveClass('item-due')
        })

        describe('when the clear list button has been clicked', () => {
          beforeEach(() => {
            userEvent.click(getClearButton())
          })

          test('both items are no longer visible', () => {
            expect(screen.queryByText(/put clothes away/i)).toBeNull()
            expect(screen.queryByText(/wash dishes/i)).toBeNull()
          })
        })
      })
    })
  })
})
