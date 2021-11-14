Feature: Progressive Web Application

  In order for my list to be helpful over time
  As someone relying on it
  I need to be able to engage with the same list across multiple devices

  Scenario: Persist through reloads
    Given my task list has a few items due
    When I leave and come back
    Then my list is still there

  Scenario: Hide the list on log out
    Given I am logged in
    And my task list has a few items due
    When I log out
    Then my list is gone

  Scenario: Show the list on log in
    Given my task list has a few items due when I'm logged in
    But I am logged out and can't see my list
    When I log in
    Then I can see my list again
