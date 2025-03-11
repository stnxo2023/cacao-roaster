# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-03-11

### Added

- Added ESLint configuration for browser and ES2021 environment with recommended rules and TypeScript support.
- Added handling for different types of data markings in Playbook.ts, including generating new IDs for IEP markings and using standardized IDs for TLP markings.
- Added a JSON validation schema for tracking the execution of CACAO playbooks in the workflow-status.json file.
- Added new file IntegrationLog.ts with classes LogItem and IntegrationLog for managing integration logs.
- Added new icons: `export_json-icon.svg`, `export_svg-icon.svg`, and `integration_soarca-icon.png`.

### Changed

- Updated USER_IDENTIFIER in .env
- Updated various files to use type imports and refactored variable declarations to use `const` instead of `let` for immutability.
- Updated imports in CacaoEditor.ts and other files to improve readability and consistency.

### Removed

- Removed .prettierrc file configuration settings.
- Removed unnecessary import statements in various files.

### Fixed

- Fixed issues with execution-status.json file, including renaming properties and updating required properties.
- Improved error handling and display in CacaoValidator.ts.
- Fixed various bugs related to integration logs and playbook handling.



## [1.2.0] - 2024-02-29

### Added

- Subfolder for CACAO Playbook examples.
- Support for importing CACAO Playbooks as text in both JSON and base64 encoded formats.
- Support for the missing HTTP headers property. Used in e.g. OpenC2 and HTTP-API commands.
- Exporting the CACAO playbooks as STIX 2.1 Course of Action object with the Playbook extension.

### Changed

- Adjusted the CSS so that the expandable lists and dictionaries don't cover other properties in the view.
- Changed the input for 'related to' property in playbook metadata from list dropdown to string.

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
