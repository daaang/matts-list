Feature: Items on Lists

  In order to manage multiple lists of things I want to do
  As any person who does not enjoy being confused
  I need habits, routines, and tasks to act as similarly as reasonable

  Scenario: I can see tasks I completed today
    Given a routine or a task is on my list
    When I complete the item
    Then the item is still on my list
    But I can see that the item is completed

  Scenario: I can't see tasks I completed before today
    Given I have completed a routine or a task on my list
    And it isn't a routine scheduled to reappear tomorrow
    When the daily reset occurs
    Then the item is no longer on my list

  Scenario: I can dismiss anything to hide it for a day
    Given an item is on my list
    When I dismiss the item
    Then the item is no longer on my list

  Scenario: Everything I dismissed yesterday is visible again today
    Given I have dismissed an item on my list
    And the item isn't completed
    And the item isn't past due
    When the daily reset occurs
    Then the item is back on my list

  Scenario Outline: Moving items around
    Given there are five items on my list in order: A, B, C, D, and E
    When I move <item> <destination>
    Then I can see that the new order is <order>

    Examples:
      | item |   destination   |     order     |
      |    D | to the top      | D, A, B, C, E |
      |    D | to the bottom   | A, B, C, E, D |
      |    D | between A and B | A, D, B, C, E |
