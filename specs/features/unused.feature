Feature: Unused elements in raw scripts

  Scenario: Unused Actions
    Given a raw script is loaded
    When the script service analyzes unused actions
    Then the analysis should complete successfully
    And the unused actions should be identified

  Scenario: Unused Variabels
    Given a raw script is loaded
    When the script service analyzes unused variables
    Then the analysis should complete successfully
    And the unused variables should be identified

  Scenario: Sub-unused Action
    Given a raw script is loaded
    When the script service analyzes subunused actions
    Then the analysis should complete successfully
    And the subunused actions should be identified

  Scenario: Sub-unused Variable
    Given a raw script is loaded
    When the script service analyzes subunused variables
    Then the analysis should complete successfully
    And the subunused variables should be identified