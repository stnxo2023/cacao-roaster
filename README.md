<img src="/artwork/CACAO-Roaster-logo.jpg" alt="CACAO Roaster logo" width="400"/>

# CACAO Roaster

[![pages-build-deployment](https://github.com/opencybersecurityalliance/cacao-roaster/actions/workflows/pages/pages-build-deployment/badge.svg?branch=gh-pages)](https://github.com/opencybersecurityalliance/cacao-roaster/actions/workflows/pages/pages-build-deployment)

**Online instance:** https://opencybersecurityalliance.github.io/cacao-roaster/

CACAO Roaster is a sub-project of the Open Cybersecurity Alliance Community (OCA Community). It is a web application for generating, parsing, validating, editing, and visualizing CACAO v2.0 playbooks.

## Citation

If you use CACAO Roaster in your work, please cite it as:

> Zych, M., Mavroeidis, V., & Open Cybersecurity Alliance Community. (2025).  
> *CACAO Roaster* (Version 1.3.0) [Computer software]. Zenodo.  
> https://doi.org/10.5281/zenodo.20570338

Citation metadata is also available in [`CITATION.cff`](CITATION.cff). On GitHub, you can use the **Cite this repository** button to export the citation in formats such as APA and BibTeX.

## Table of Contents

- [CACAO Roaster](#cacao-roaster)
- [Citation](#citation)
- [Introduction](#introduction)
  - [Project status](#project-status)
  - [Integration with CACAO Orchestrator](#integration-with-cacao-orchestrator)
  - [Integration with OCA Community and OASIS projects](#integration-with-oca-community-and-oasis-projects)
  - [Screenshots of the application](#screenshots-of-the-application)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Deployment](#deployment)
  - [Contributing](#contributing)
  - [Maintainers](#maintainers)
  - [Support](#support)
    - [Sign up for our mailing list](#sign-up-for-our-mailing-list)
    - [Join us on Slack](#join-us-on-slack)
  - [License](#license)
- [Governance](#governance)
- [CLA and Non-assert signatures required](#cla-and-non-assert-signatures-required)

## Introduction

As cyber systems become increasingly complex and cybersecurity threats become more prominent, defenders must prepare, coordinate, automate, document, and share their response methodologies whenever possible. The CACAO standard was developed to address these requirements by providing a common, machine-readable framework and schema for documenting cybersecurity operations processes, including defensive tradecraft, tactics, techniques, and procedures.

To support wider adoption of the CACAO standard, it is important to simplify the creation, modification, and understanding of CACAO playbooks. **CACAO Roaster addresses this need by providing a faster and easier way to create, edit, visualize, and share CACAO playbooks through a no-code graphical interface.**

The CACAO Roaster web application fully complies with the [CACAO Security Playbooks v2.0 Committee Specification 01](https://docs.oasis-open.org/cacao/security-playbooks/v2.0/security-playbooks-v2.0.pdf).

### Project status

CACAO Roaster is currently stable at version 1.3.0 and is under continuous maintenance.

The maintenance team tracks open issues and work items on the GitHub issues page.

### Integration with CACAO Orchestrator

CACAO Roaster includes a basic integration with the CACAO orchestrator/executor [SOARCA](https://github.com/COSSAS/SOARCA).

To use this integration, you need a running instance of SOARCA. You can configure CACAO Roaster to use it by setting the `SOARCA_URL` environment variable to the SOARCA instance URL, or by providing the SOARCA URL directly in the SOARCA integration window in CACAO Roaster.

Integration with the CACAO executor SOARCA.

![Integration with the CACAO executor SOARCA.](/artwork/CACAO-Roaster-Integraion.png)

### Integration with OCA Community and OASIS projects

CACAO Roaster is aligned with CACAO and can be used alongside related OCA Community and OASIS cybersecurity automation efforts, including STIX and OpenC2.

### Screenshots of the application

Start screen of the application.

![Start screen of the application.](/artwork/CACAO-Roaster-1.png)

Example of a playbook view.

![Example of a playbook view.](/artwork/CACAO-Roaster-2.png)

## Getting Started

These instructions will help you run CACAO Roaster locally for development purposes. See the deployment section for notes on running the project on a live system.

### Prerequisites

- Node.js >= 20.5.0
- npm >= 9.8.0

### Installation

Install the project dependencies:

```bash
npm i
```

Run the project locally in development mode:

```bash
npm run start
```

CACAO Roaster will be available locally at:

```text
http://localhost:3000/
```

Build the project for production:

```bash
npm run build
```

### Deployment

Install the `serve` package on the hosting machine:

```bash
npm install serve
```

Serve the production bundle:

```bash
serve dist
```

Alternatively, use [Docker](https://www.docker.com/) to build and run the application in a container:

```bash
docker build -t cacao-roaster .
docker run -it -p 3000:3000 cacao-roaster
```

### Contributing

Contributions are welcome. You can contribute by reporting issues, suggesting improvements, improving documentation, or submitting pull requests.

Before contributing, please review the repository guidelines in [CONTRIBUTING.md](/CONTRIBUTING.md). Technical contributions must also satisfy the CLA and non-assert requirements described below.

### Maintainers

- Mateusz Zych: [https://github.com/mateusdz](https://github.com/mateusdz)
- Vasileios Mavroeidis: [https://github.com/Vasileios-Mavroeidis](https://github.com/Vasileios-Mavroeidis)

### Support

For support, questions, feature requests, or bug reports, please use the GitHub issues page or the community channels listed below.

#### Sign up for our mailing list

Stay up to date on meetings, announcements, and other discussions with the [CACAO Roaster mailing list](https://lists.oasis-open-projects.org/g/oca-cacao-roaster). To subscribe, send an empty email to [oca-cacao-roaster+subscribe@lists.oasis-open-projects.org](mailto:oca-cacao-roaster+subscribe@lists.oasis-open-projects.org).

#### Join us on Slack

CACAO Roaster has a Slack channel on the OCA Community Slack. [Join here](https://join.slack.com/t/open-cybersecurity/shared_invite/zt-1jsgt1053-oYsfBPXXChhbRO4JO5Xo1A) and say hi in `#cacao-roaster`.

### License

This project is licensed under the Apache 2.0 License. See the [LICENSE.md](LICENSE.md) file for details.

## Governance

CACAO Roaster operates as a sub-project of the Open Cybersecurity Alliance Community (OCA Community). Further details can be found in the [OCA Community Governance](https://github.com/opencybersecurityalliance/oca-community-project/blob/main/COMMUNITY-GOVERNANCE.md) document.

## CLA & Non-assert signatures required

All technical contributions must be covered by a Contributor's License Agreement. This requirement allows our work to advance through OASIS standards development stages and potentially be submitted to de jure organizations such as ISO. You will get a prompt to sign this document when you submit your first pull request to a project repository, or you can sign [here](https://www.oasis-open.org/open-projects/cla/oasis-open-projects-individual-contributor-license-agreement-i-cla/). If you are contributing on behalf of your employer, you must also sign the ECLA [here](https://www.oasis-open.org/open-projects/cla/entity-cla-20210630/).
