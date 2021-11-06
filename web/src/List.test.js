/* global describe, beforeEach, test, expect, document */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import List from './List'

const activeElement = () => { return document.activeElement || document.body }
const getButtonClear = () => screen.getByRole('button', { name: /clear/i })
const getButtonAddItem = () => screen.getByRole('button', { name: /add/i })
const queryInputNewItem = () => screen.queryByRole('textbox', { name: /new item/i })

describe('a new List', () => {
  beforeEach(() => {
    render(<List />)
  })

  test('renders no text fields for new items', () => {
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
        expect(screen.queryByText(/wash dishes/i)).toBeNull()
        userEvent.type(activeElement(), 'wash dishes{enter}', { skipClick: true })
      })

      test('an item called "wash dishes" is due', () => {
        expect(screen.getByText(/wash dishes/i)).toHaveClass('item-due')
      })

      test('the new item field is no longer present', () => {
        expect(queryInputNewItem()).toBeNull()
      })

      describe('when I add a second item', () => {
        beforeEach(() => {
          userEvent.click(getButtonAddItem())
          expect(screen.queryByText(/put clothes away/i)).toBeNull()
          userEvent.type(activeElement(), 'put clothes away{enter}', { skipClick: true })
        })

        test('the new item is due', () => {
          expect(screen.getByText(/put clothes away/i)).toHaveClass('item-due')
        })

        test('the "wash dishes" item is still due', () => {
          expect(screen.getByText(/wash dishes/i)).toHaveClass('item-due')
        })

        describe('when the clear list button has been clicked', () => {
          beforeEach(() => {
            userEvent.click(getButtonClear())
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
