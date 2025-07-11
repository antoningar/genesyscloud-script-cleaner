Feature: Unused elements in raw scripts

  Scenario: Unused Actions
    Given a raw script is loaded
    When the script service analyzes unused actions
    Then the analysis should complete successfully
    And the unused actions should be identified