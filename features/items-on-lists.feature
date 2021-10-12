Feature: Items on Lists

  In order to manage multiple lists of things I want to do
  As any person who does not enjoy being confused
  I need habits, routines, and tasks to act as similarly as reasonable

  Not all items share all these behaviors, but all tasks have these
  behaviors. Habits and routines are essentially defined by the
  particular ways they defy some of these behaviors, but they can
  generally be expected to behave the same.

  Scenario: Adding items
    Given an empty task list
    When I add an item called "wash dishes"
    Then the list has exactly one item
    And that item is called "wash dishes"
    And "wash dishes" is due

  Scenario: Seeing complete items
    Given an item is on my task list
    When I complete the item
    Then the item is still on my list
    But I can see that the item is complete

  Scenario: Removing complete items
    Given I have completed an item on my task list
    When the daily reset occurs
    Then the item is no longer on my list

  Scenario: Dismissing items to put them off until tomorrow
    Given an item is on my task list
    When I dismiss the item
    Then the item is no longer on my list

  Scenario: Displaying items that were dismissed yesterday
    Given I have dismissed an item on my task list
    And the item isn't complete
    When the daily reset occurs
    Then the item is back on my list

  Scenario Outline: Moving items around
    Given there are five items on my task list in order: A, B, C, D, and E
    When I move <item> <destination>
    Then I can see that the new order is <order>

    Examples:
      | item |   destination   |     order     |
      |    D | to the top      | D, A, B, C, E |
      |    D | to the bottom   | A, B, C, E, D |
      |    D | between A and B | A, D, B, C, E |
