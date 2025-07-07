Feature: Example Lambda Function
  As a developer
  I want to test my lambda function
  So that I can ensure it works correctly

  Scenario: Successful function execution
    Given a valid input event
    When the lambda function is invoked
    Then it should return a successful response
    And the response should contain the expected message