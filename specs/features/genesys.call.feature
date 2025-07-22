Feature: Call with script id

  Scenario: Script id input
    Given A script id
    When function is called with a script id as input
    Then function is retrieving the script thanks to genesys