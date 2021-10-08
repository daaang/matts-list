Feature: Routines

  In order to maintain my body and the place where I live
  As someone lacking sufficient intrinsic motivation
  I need to know which routine tasks are on my list today

  Background:
    Given Laundry is a weekly routine I've set to appear every Monday

  Scenario: It's never too late to do a routine
    Given today is Sunday
    And I haven't done Laundry
    When Monday comes
    Then Laundry is still on my list

  Scenario: I don't see completed routines
    Given today is Sunday
    And I did Laundry last Thursday
    Then Laundry is not on my list

  Scenario: Routines I did very recently are optional
    Given today is Sunday
    And I did Laundry last Thursday
    When Monday comes
    Then Laundry is back on my list
    But I can see that Laundry is optional

  Scenario: Routines stop being optional once the desired period passes
    Given today is Wednesday
    And I did Laundry last Thursday
    When Thursday comes
    Then Laundry is no longer optional
