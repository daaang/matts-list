Feature: Daily Habits

  In order to cultivate new habits
  As someone lacking sufficient intrinsic motivation
  I need to keep track of my habits for the day

  Background:
    Given a habit called Meditate is the only habit on my list

  Scenario: Habits aren't optional if they haven't been done today
    Given I have not completed the Meditate habit today
    Then I can see Meditate on my list of habits
    And the Meditate habit is not optional

  Scenario: Habits are optional once they've been done today
    Given I have not completed the Meditate habit today
    When I complete the Meditate habit
    Then I can see Meditate on my list of habits
    And the Meditate habit is optional

  Scenario: Habits display a counter
    Given I have completed the Meditate habit once today
    When I complete the Meditate habit a second time
    Then I can see Meditate on my list of habits
    And the Meditate habit is optional
    And I can see that I've completed the Meditate habit twice today

  Scenario: Habits' counters reset daily
    Given I have completed the Meditate habit once today
    When the daily reset occurs
    Then I can see Meditate on my list of habits
    And the Meditate habit is not optional
