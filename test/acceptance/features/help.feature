Feature: Help screen

  Scenario: Show help with --help flag
    When I run "squad --help"
    Then the output contains "Usage:"
    And the output contains "Getting Started"
    And the output contains "init"
    And the output contains "squad <command> --help"
    And the exit code is 0

  Scenario: Show help with help command
    When I run "squad help"
    Then the output contains "Usage:"
    And the exit code is 0
