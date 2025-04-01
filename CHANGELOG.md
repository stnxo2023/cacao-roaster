# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-04-01

### Added

- Added ESLint configuration for browser and ES2021 environment with recommended rules and TypeScript support.
- Added handling for different types of data markings in Playbook.ts, including generating new IDs for IEP markings and using standardized IDs for TLP markings.
- Added new icons: `export_json-icon.svg`, `export_svg-icon.svg`, and `integration_soarca-icon.png`.
- Added support for .env file with demo key pair for signing and verifying playbooks
- Added new buttons in User Settings to manage signing keys
- Added STIX Bundle wrapper when exporting CACAO playbook as STIX 2.1 COA
- Added SOARCA integration (v1.0.0)
- Added new file IntegrationLog.ts with classes LogItem and IntegrationLog for managing integration logs.
- Added integration logs window with collapsible UI and drag functionality
- Added execution status model and JSON schema for tracking workflow execution
- Added visual node update event listener for improved step status tracking
- Added UUID generation for IEP markings without valid IDs (#19)
- Added 'dname' in address types for relevant objects (#14)

### Changed

- Updated various files to use type imports and refactored variable declarations to use `const` instead of `let` for immutability.
- Updated imports in CacaoEditor.ts and other files to improve readability and consistency.
- Changed property name in STIX 2.1 COA Playbook extension from _base64 to _bin
- Improved data marking definitions handling with standardized ID assignment for TLP markings (#19)
- Refactored Soarca class and added Ping functionality with status
- Refactored UserSettingsProps and improved playbook creator identifier handling (#24, #25)
- Reduced time between execution status checks
- Updated execution status model initialization and handling
- Merged all export options into a dropdown menu
- Improved playbook loading performance x2
- Improved Dockerfile for a smaller and more secure image

### Removed

- Removed unnecessary import statements in various files.

### Fixed

- Fixed issues with the execution-status.json file, including renaming properties and updating required properties.
- Improved error handling and display in CacaoValidator.ts.
- Fixed various bugs related to integration logs and playbook handling.
- Fixed bug preventing creation and display of external references (#18)
- Fixed ExecutionStatus issues: Variables showing as [Object object], commands_b64 display issues, automated_execution casting
- Fixed status dots on visual nodes not changing color, and added log clearing on new executions
- Fixed reactivity of revoke playbook tag (#21)
- Fixed data marking definitions handling (#19)
- Fixed playbook creator identifier population (#24, #25)

## [1.2.0] - 2024-02-29

### Added

- Subfolder for CACAO Playbook examples.
- Support for importing CACAO Playbooks as text in both JSON and base64 encoded formats.
- Support for the missing HTTP headers property. Used in e.g., OpenC2 and HTTP-API commands.
- Exporting the CACAO playbooks as STIX 2.1 Course of Action objects with the Playbook extension.

### Changed

- Adjusted the CSS so that the expandable lists and dictionaries don't cover other properties in the view.
- Changed the input for the 'related to' property in playbook metadata from a list dropdown to a string.

### Removed

- The unevaluatedProperties:false from the CACAO JSON validation schemas.

### Fixed

- Storing and retrieving of Caldera-cmd commands.

## [1.1.0] - 2024-02-15

### Removed

- Removed sample keys for signing and verifying playbooks.

## [1.0.0] - 2024-01-17

### Added

- Version 1.0.0 of the CACAO Roaster.
