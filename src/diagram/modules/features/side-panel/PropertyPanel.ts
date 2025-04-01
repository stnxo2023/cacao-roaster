import type PlaybookHandler from '../../model/PlaybookHandler';
import {
  extractSchemaTypes,
  schemaDictWithoutAgentTarget,
  identifierReferences,
  uneditableProperties,
  removedProperties,
  orderInputList,
  tlpv2_levels,
  stepWithStatus,
  uneditablePropertiesTimestamp,
  schemaDictWithoutCommands,
} from '../../model/SchemaTypes';
import type { BasicInput } from './BasicInput';
import { CheckboxInput } from './BasicInputs/CheckboxInput';
import { DropDownInput } from './BasicInputs/DropDownInput';
import { EnumListenedInput } from './BasicInputs/EnumListenedInput';
import { NumberInput } from './BasicInputs/NumberInput';
import { OpenDropDownInput } from './BasicInputs/OpenDropDownInput';
import { TextAreaInput } from './BasicInputs/TextAreaInput';
import { TextFieldInput } from './BasicInputs/TextFieldInput';
import { OvListenedInput } from './BasicInputs/OvListenedInput';
import { UneditableInput } from './BasicInputs/UneditableInput';
import { DictionaryDefinition } from './DictionaryDefinition';
import { DictionaryVariable } from './DictionaryVariable';
import { LabeledInput } from './LabeledInput';
import { ListOfCases } from './ListInput/ListOfCases';
import { ListOfContactInfo } from './ListInput/ListOfContactInfo';
import { ListOfIdentifier } from './ListInput/ListOfIdentifier';
import { ListOfObject } from './ListInput/ListOfObject';
import { ListOfOpenVocab } from './ListInput/ListOfOpenVocab';
import { ListOfString } from './ListInput/ListOfString';
import { ListOfCommandsB64 } from './ListInput/ListOfCommandsB64'
import { ListOfHeaders } from './ListInput/ListOfHeaders';
import { PanelButton } from './PanelButton';
import type { PanelElement } from './PanelElement';
import { PanelInput } from './PanelInput';
import { SingleObjectInput } from './SingleObjectInput';
import { ListOfAddress } from './ListInput/ListOfAddress';
import { DictionaryExtension } from './DictionaryExtension';
import { CounterSignatureInput } from './CounterSignatureInput';
import { ListAgentTarget } from './ListAgentTarget';
import { ListOfAgent } from './ListInput/ListOfAgent';
import { DatePickerInput } from './BasicInputs/DatePickerInput';
import { TitleInput } from './TitleInput';
import { ListOfTargets } from './ListInput/ListOfTargets';
import { CommandInput } from './BasicInputs/CommandInput';
import { ComplexInput } from './ComplexInput';
import { DictionaryStatus } from './DictionaryStatus';
import { HiddenInput } from './HiddenInput';
import { AgentInput } from './BasicInputs/AgentInput';
import { ExecutedStatus } from './ExecutedStatus';
import CacaoUtils from '../../core/CacaoUtils';
import { UneditableDateInput } from './BasicInputs/UneditableDateInput';
import type { Schema } from 'ajv';
import { ExecutionStatus } from '../../model/status/status-model/ExecutionStatus';

/**
 * A PropertyPanel is contained within the side panel of within a dialog.
 */
export default class PropertyPanel {
  _elements: Array<PanelElement> = [];
  _elementsDisplay: { [key: string]: boolean } = {};
  _playbookHandler: PlaybookHandler;
  _propertyType: string;
  _container: HTMLElement;
  _propertiesParentContainer!: HTMLElement;
  _defaultValues: any;
  _schemaData: any;
  _isSubPanel = false;
  _isExtension = false;
  _isStatus = false;
  _stepId?: string;
  _propertiesContainer!: HTMLElement;
  _jsonContainer!: HTMLElement;
  _statusContainer!: HTMLElement;
  _buttonContainer!: HTMLDivElement;
  _notifyFunction: any = () => { };
  _previousPanel: any;
  _previousStatus: ExecutionStatus;
  _showHeader = true;
  _showSwitcherJSON = true;
  _showActionButtons = true;
  _wrapper!: HTMLElement;
  _subContainer!: HTMLElement;
  _statusDefaultValues: ExecutionStatus;
  _statusInput!: DictionaryStatus;
  _propertyKey?: string;
  _keyInput?: LabeledInput;
  _keyValue?: string;
  _keyType?: string;
  _isAgentTarget = true;

  constructor(
    playbookHandler: PlaybookHandler,
    propertyType: string,
    defaultValues: any,
    container: HTMLElement,
    stepId?: string,
  ) {
    this._playbookHandler = playbookHandler;
    this._propertyType = propertyType;
    this._container = container;
    this._defaultValues = defaultValues;
    this._stepId = stepId;
    this._statusDefaultValues = playbookHandler.getExecutionStatus();
    this._previousStatus = new ExecutionStatus();

    this._buttonContainer = document.createElement('div');
    this._buttonContainer.classList.add('sidepanel__action');
    this._buttonContainer.classList.add(`${this._propertyType?.replace(/ /g, '_')}--color`);

    this._statusContainer = document.createElement('div');
    this._statusContainer.classList.add('sidepanel__section');
  }

  setIsAgentTarget(isAgentTarget: boolean) {
    this._isAgentTarget = isAgentTarget;
    this._schemaData = this.extractSchemaFromType(this._propertyType);
  }

  setPreviousPanel(previous: any) {
    this._previousPanel = previous;
  }

  setPreviousStatus(previous: ExecutionStatus) {
    if (previous) {
      Object.assign(this._previousStatus, previous);
    } else {
      this._previousStatus = new ExecutionStatus();
    }
  }

  setSchemaData(schemaData: any) {
    this._schemaData = schemaData;
  }

  setIsSubPanel(isSubPanel: boolean) {
    this._isSubPanel = isSubPanel;
  }

  setPropertyKey(key: string, propertyType: string, defaultValue: string) {
    this._propertyKey = key;
    this._keyType = propertyType;
    this._keyValue = defaultValue;
  }

  getPropertyKey(): string {
    if (this._propertyKey && this._keyInput) {
      return this._keyInput.submit();
    }
    return '';
  }

  showSwitcherJSON(val: boolean) {
    this._showSwitcherJSON = val;
  }

  showHeader(val: boolean) {
    this._showHeader = val;
  }

  showActionButtons(val: boolean) {
    this._showActionButtons = val;
  }

  setIsExtension(isExtension: boolean) {
    this._isExtension = isExtension;
  }

  setIsStatus(isStatus: boolean) {
    this._isStatus = isStatus;
  }

  hasStatus(): boolean {
    if (!this._stepId) return false;
    const step = this._playbookHandler.getStep(this._stepId);
    return step && stepWithStatus.includes(step.type);
  }

  /**
   * Adds a button to the list of elements.
   * @param title string, Text displayed inside the panel.
   * @param lambda function to call when pressing the button.
   */
  addButton(title: string, lambda: () => any) {
    const button = new PanelButton(title, this._buttonContainer, lambda);
    button.addClass('action__btn');
    button.addClass('btn--big');
    this._elements.push(button);
  }

  /**
   * Sets a class to the attribut container
   * @param className string
   */
  addClass(className: string) {
    this._container.classList.add(className);
  }

  /**
   * Adds all the properties inputs to the container.
   */
  addAllProperties() {
    this._subContainer = document.createElement('div');
    this._subContainer.className = 'sidepanel__sub';

    this._wrapper = document.createElement('div');
    this._wrapper.className = 'sidepanel__wrapper';

    if (this._showHeader) {
      this.addHeaderContainer();
    }
    if (this._showSwitcherJSON) {
      this.addModeSwitcher();
    }
    this._subContainer.appendChild(this._wrapper);
    this._container.appendChild(this._subContainer);
    this.addAllElementsFromSchema();
    if (this._showSwitcherJSON) {
      this.loadJsonContainer();
    }
    if (this.hasStatus()) {
      this.addStatus();
    }
  }

  addStatus() {
    const statusList = document.createElement('div');
    this._statusInput = new DictionaryStatus('Execution_Status', 'workflow-status', this._playbookHandler, statusList, () => {
      this.reloadStatus();
      this._notifyFunction();
    });
    if (this._stepId) {
      this._statusInput.setStepId(this._stepId);
      const defaultValues = this._playbookHandler.getStepStatus(this._stepId);
      this._statusInput.setDefaultValues(defaultValues ? defaultValues : []);
    }
    this._statusInput.addToContainer();
    this._statusContainer.appendChild(statusList);
  }

  loadJsonContainer() {
    this._jsonContainer = document.createElement('div');
    this._jsonContainer.classList.add('sidepanel__section');
    this._jsonContainer.classList.add('section--json');

    const jsonField = document.createElement('textarea');
    jsonField.classList.add('property__container');
    jsonField.classList.add('container--simple');
    jsonField.classList.add('container--textarea');
    jsonField.classList.add('container--json');
    jsonField.disabled = true;

    const jsonString = JSON.stringify(CacaoUtils.filterEmptyValues(this.submit()), null, 10);
    jsonField.value = jsonString;

    this._jsonContainer.appendChild(jsonField);
  }

  addModeSwitcher() {
    const entries: [string, any][] = [];
    const entriesContainer: HTMLElement[] = [];
    entries.push([
      'properties',
      () => {
        this._propertiesParentContainer.innerHTML = '';
        this._propertiesParentContainer.appendChild(this._propertiesContainer);
      },
    ]);
    entries.push([
      'json',
      () => {
        this._propertiesParentContainer.innerHTML = '';
        this._propertiesParentContainer.appendChild(this._jsonContainer);
      },
    ]);

    if (this.hasStatus()) {
      entries.push([
        'execution status',
        () => {
          this._propertiesParentContainer.innerHTML = '';
          this._propertiesParentContainer.appendChild(this._statusContainer);
        },
      ]);
    }

    const modeSwitcherContainer = document.createElement('div');

    modeSwitcherContainer.classList.add(`${this._propertyType?.replace(/ /g, '_')}--color`);
    modeSwitcherContainer.classList.add('sidepanel__switcher');

    for (const entry of entries) {
      const entryContainer = document.createElement('div');
      entryContainer.classList.add('switcher__entry');
      entryContainer.innerText = entry[0];
      entryContainer.onclick = () => {
        entry[1]();
        entriesContainer.forEach(entry => {
          entry.classList.remove('entry--selected');
        });
        entryContainer.classList.add('entry--selected');
      };
      entriesContainer.push(entryContainer);
      modeSwitcherContainer.appendChild(entryContainer);
    }

    entriesContainer[0]?.classList.add('entry--selected');
    this._container.appendChild(modeSwitcherContainer);
  }

  private addHeaderContainer() {
    const headerSection = document.createElement('div');
    headerSection.classList.add('sidepanel__section');
    headerSection.classList.add('section--header');
    headerSection.classList.add(`${this._propertyType?.replace(/ /g, '_')}--color`);

    let title = this._propertyType;

    if (this._stepId) {
      //if the object is a step
      title += ' Step';
    }

    const element = new TitleInput('title', title, headerSection, false);
    element.addClass('header__title');
    this._elements.push(element);

    let id = this._stepId;

    if (!id) {
      if (['playbook', 'signature', 'execution-status'].includes(this._propertyType)) {
        //if the object is not a step, but is a playbook or a signature
        id = this._defaultValues.id;
      }
    }

    if (id) {
      const element = new TitleInput('id', id, headerSection);
      element.addClass('header__id');
      this._elements.push(element);
    }

    this._container.appendChild(headerSection);
  }

  /**
   * Adds all common properties inputs to the container.
   */
  private addCommonProperties(): void {
    if (this.isCommonPropertiesEmpty()) {
      for (const propertyName in this._schemaData.commonProperties) {
        this.handleLabeledInput(
          propertyName,
          this._schemaData.commonProperties[propertyName],
          this._propertiesContainer,
          this._defaultValues,
        );
      }
    }
  }

  /**
   * Adds all specific properties inputs to the container. Displays a "Specific Properties" title if there also are common properties.
   */
  private addSpecificProperties(): void {
    if (this.isSpecificPropertiesEmpty()) {
      for (const propertyName in this._schemaData.properties) {
        this.handleLabeledInput(
          propertyName,
          this._schemaData.properties[propertyName],
          this._propertiesContainer,
          this._defaultValues,
        );
      }
    }
  }

  // Returns true if the current construct contains common properties, else false.
  private isCommonPropertiesEmpty(): boolean {
    return (
      this._schemaData.commonProperties &&
      !(Object.keys(this._schemaData.commonProperties).length === 0)
    );
  }

  // Returns true if the current construct contains specific properties, else false.
  private isSpecificPropertiesEmpty(): boolean {
    return this._schemaData.properties && !(Object.keys(this._schemaData.properties).length === 0);
  }

  /**
   * Handles inputs based on their names.
   * @returns boolean set to true if an input was created, false otherwise.
   */
  handleInputFromName(propertyName: string, propertyType: any, container: HTMLElement, defaultValues: any): boolean {
    if (propertyName === 'created_by' && this._propertyType === 'extension-definition') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new TextFieldInput(propertyName, defaultValues[propertyName]),
      );
    } else if (propertyName === 'tlpv2_level') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new DropDownInput(propertyName, defaultValues[propertyName], tlpv2_levels, false),
      );
    } else if (propertyName === 'revoked') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new CheckboxInput(propertyName, defaultValues[propertyName], true),
      );
    } else if (this._propertyType === 'playbook-processing-summary') {
      const select = new DropDownInput(propertyName, defaultValues[propertyName], ['true', 'false']);
      select.setCSSClass('container--shorted');
      this.createLabeledInput(propertyName, propertyType, container, select, 'property--reversed');
    } else if (propertyName === 'schema') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new TextAreaInput(propertyName, defaultValues[propertyName]),
      );
    } else if (propertyName === 'in_args' || propertyName === 'out_args') {
      const variable_list = this._playbookHandler.getAllPropertyIdentifier('playbook_variables');
      if (this._stepId) {
        variable_list.push(...Object.keys(defaultValues.step_variables));
      }
      const complexInput = new ListOfIdentifier(
        propertyName,
        propertyType,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setOptions(variable_list);
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName === 'command') {
      const labeledInput = new LabeledInput(propertyName, container);
      const commandInput = new CommandInput(propertyName, defaultValues[propertyName]);
      commandInput.setIsBase64(false);
      commandInput.setLambda((dis: boolean) => {
        const commandBase64Exists = this._elements.find(obj =>
          (obj as any)._propertyName.includes('command_b64'),
        ) as any;
        const contentBase64Exists = this._elements.find(obj =>
          (obj as any)._propertyName.includes('content_b64'),
        ) as any;
        if (commandBase64Exists && !contentBase64Exists) {
          commandBase64Exists._basicInput.setDisabled(dis);
        }
      });

      labeledInput.setBasicInput(commandInput);
      this._elements.push(labeledInput);
    } else if (propertyName === 'command_b64' || propertyName === 'content_b64') {
      const labeledInput = new LabeledInput(propertyName, container);
      labeledInput.addClass('label__b64');
      const commandInput = new CommandInput(propertyName, defaultValues[propertyName]);
      commandInput.setIsBase64(true);
      commandInput.setLambda((dis: boolean) => {
        if (propertyName === 'content_b64') return;
        const commandExists = this._elements.find(
          obj => (obj as any)._propertyName === 'command',
        ) as any;
        if (commandExists) {
          commandExists._basicInput.setDisabled(dis);
        }
      });

      labeledInput.setBasicInput(commandInput);
      this._elements.push(labeledInput);
    } else if (propertyName === 'derived_from') {
      const complexInput = new ListOfString(
        propertyName,
        propertyType,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName === 'related_to') {
      const complexInput = new ListOfString(
        propertyName,
        propertyType,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName === 'agent') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new AgentInput(
          propertyName,
          defaultValues[propertyName],
          this._playbookHandler,
          'agent-target',
          () => {
            this._playbookHandler.setPlaybookProperties(this.submit(), this._stepId);
            this._notifyFunction();
          },
        ),
      );
    } else if (propertyName === 'targets') {
      const labeledInput = new ListAgentTarget(
        propertyName,
        propertyType,
        container,
        this._playbookHandler,
        () => {
          this.reloadProperties(this._isAgentTarget, this._propertyType);
          this._playbookHandler.setPlaybookProperties(this.submit(), this._stepId);
          this._notifyFunction();
        },
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      labeledInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(labeledInput);
    } else if (propertyName === 'id') {
      const complexInput = new HiddenInput(propertyName, container);
      complexInput.setValue(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName === 'signatures') {
      const complexInput = new ListOfObject(
        propertyName,
        propertyType.replace('[]', ''),
        this._playbookHandler,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      complexInput.addContainerCSSClass('property--disable');
      this._elements.push(complexInput);
    } else if (propertyName === 'address') {
      const complexInput = new ListOfAddress(
        propertyName,
        propertyType,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName === 'phone' || propertyName === 'email') {
      const complexInput = new ListOfContactInfo(
        propertyName,
        propertyType,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      complexInput.setDict();
      this._elements.push(complexInput);
    } else if (propertyName === 'cases') {
      const complexInput = new ListOfCases(propertyName, 'identifier', container);
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName === 'commands') {
      const complexInput = new ListOfObject(
        propertyName,
        propertyType.replace('[]', ''),
        this._playbookHandler,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName === 'description') {
      // Generates a Text Area field
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new TextAreaInput(propertyName, defaultValues[propertyName]),
      );
    } else if (
      typeof propertyType === 'string' &&
      propertyType.split('-')[propertyType.split('-').length - 1] === 'enum' &&
      propertyName === 'type' &&
      !this._stepId
    ) {
      // Handles the enum types
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new EnumListenedInput(
          propertyName,
          defaultValues[propertyName],
          this._schemaData.enums[propertyType],
          (a: any) => {
            this.reloadProperties(this._isAgentTarget, a);
          },
        ),
      );
    } else if (
      removedProperties.includes(propertyName) ||
      propertyType === 'playbook' ||
      propertyType === 'workflow-step-type-enum'
    ) {
      const complexInput = new HiddenInput(propertyName, container);
      complexInput.setValue(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (uneditableProperties.includes(propertyName)) {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new UneditableInput(propertyName, defaultValues[propertyName]),
      );
    } else if (uneditablePropertiesTimestamp.includes(propertyName)) {
      let date: string;
      if (CacaoUtils.isUndefined(defaultValues[propertyName])) {
        date = '';
      } else {
        date = new Date(defaultValues[propertyName]).toISOString();
      }
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new UneditableDateInput(propertyName, date),
      );
    } else if (
      propertyType === 'identifier' &&
      Object.keys(identifierReferences).includes(propertyName)
    ) {
      const identifierList = this._playbookHandler.getAllPropertyIdentifier(
        identifierReferences[propertyName],
      );
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new DropDownInput(propertyName, defaultValues[propertyName], identifierList),
      );
    } else if (propertyName === 'headers') {
      // Handles http headers property in OpenC2 and http-api commands
      const complexInput = new ListOfHeaders(
        propertyName,
        propertyType,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName.includes('_definitions')) {
      // Handles definition properties
      const complexInput = new DictionaryDefinition(
        propertyName,
        propertyName,
        this._playbookHandler,
        container,
        () => {
          this.reloadProperties(this._isAgentTarget, this._propertyType);
        },
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName.includes('_extensions')) {
      // Handles extension properties
      const identifierList = this._playbookHandler.getAllPropertyIdentifier(
        identifierReferences[propertyName],
      );
      const complexInput = new DictionaryExtension(
        propertyName,
        propertyName,
        this._playbookHandler,
        container,
        identifierList,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else {
      return false;
    }
    return true;
  }

  /**
   * Handles inputs based on their types.
   * @returns boolean set to true if an input was created, false otherwise.
   */
  handleInputFromType(propertyName: string, propertyType: any, container: HTMLElement, defaultValues: any): boolean {
    if (propertyType === 'agents-display') {
      const agentTargetList = this._playbookHandler.getAllPropertyDict(identifierReferences.agent);
      const complexInput = new ListOfAgent(
        propertyName,
        propertyType,
        agentTargetList,
        this._playbookHandler,
        container,
      );
      complexInput.setDefaultValues(defaultValues);
      complexInput.setReloadCallback(() => {
        this.reloadClearedDifferentProperties('agents-display', this.submit()['agents-display']);
      });
      complexInput.setClearFunction(() => {
        this.reloadClearedDifferentProperties('agents-display', {});
      });
      this._elements.push(complexInput);
    } else if (propertyType === 'targets-display') {
      // A specific propertyType to display the table which handles the agent and targets inside action step
      const agentTargetList = this._playbookHandler.getAllPropertyDict(
        identifierReferences.targets,
      );
      const complexInput = new ListOfTargets(
        propertyName,
        propertyType,
        agentTargetList,
        this._playbookHandler,
        container,
      );
      complexInput.setDefaultValues(defaultValues);
      complexInput.setReloadCallback(() => {
        this.reloadClearedDifferentProperties(
          'targets-display',
          Object.values(this.submit()['targets-display']),
        );
      });
      complexInput.setClearFunction(() => {
        this.reloadClearedDifferentProperties('targets-display', {});
      });
      this._elements.push(complexInput);
    } else if (propertyType === 'string') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new TextFieldInput(propertyName, defaultValues[propertyName]),
      );
    } else if (propertyType === 'timestamp') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new DatePickerInput(propertyName, defaultValues[propertyName]),
        'label__time',
      );
    } else if (propertyType === 'identifier[]') {
      const identifierList = this._playbookHandler.getAllPropertyIdentifier(
        identifierReferences[propertyName],
      );
      const complexInput = new ListOfIdentifier(
        propertyName,
        propertyType,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setOptions(identifierList);
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyType === 'identifier') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new TextFieldInput(propertyName, defaultValues[propertyName]),
      );
    } else if (propertyType === 'boolean') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new CheckboxInput(propertyName, defaultValues[propertyName]),
      );
    } else if (propertyType === 'integer' || propertyType === 'number') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new NumberInput(propertyName, defaultValues[propertyName]),
      );
    } else if (propertyType === 'agent-target-type-ov') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new OvListenedInput(
          propertyName,
          defaultValues[propertyName],
          this._schemaData.enums[propertyType],
          (a: any) => {
            this.reloadProperties(this._isAgentTarget, a);
          },
          this._propertyType,
        ),
      );
    } else if (propertyType === 'authentication-info-type-ov') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new OvListenedInput(
          propertyName,
          defaultValues[propertyName],
          this._schemaData.enums[propertyType],
          (a: any) => {
            this.reloadProperties(this._isAgentTarget, a);
          },
          this._propertyType,
        ),
      );
    } else if (propertyType === 'command-type-ov') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new OvListenedInput(
          propertyName,
          defaultValues[propertyName],
          this._schemaData.enums[propertyType],
          (a: any) => {
            this.reloadProperties(this._isAgentTarget, a);
          },
          this._propertyType,
        ),
      );
    } else if (propertyType === 'string[]') {
      const complexInput = new ListOfString(
        propertyName,
        propertyType,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (
      typeof propertyType === 'string' &&
      propertyType.split('-')[propertyType.split('-').length - 1] === 'ov'
    ) {
      // Handles the general open vocabulary case
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new OpenDropDownInput(
          propertyName,
          defaultValues[propertyName],
          this._schemaData.enums[propertyType],
        ),
      );
    } else if (
      typeof propertyType === 'string' &&
      propertyType.split('-')[propertyType.split('-').length - 1] === 'ov[]'
    ) {
      // Handles the general list of open vocabulary case
      propertyType = propertyType.replace('[]', '');
      const identifierList = this._schemaData.enums[propertyType];
      const complexInput = new ListOfOpenVocab(
        propertyName,
        propertyType,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setOptions(identifierList);
      complexInput.setDefaultValues(defaultValues[propertyName] ? defaultValues[propertyName] : {});
      this._elements.push(complexInput);
    } else if (
      typeof propertyType === 'string' &&
      propertyType.split('-')[propertyType.split('-').length - 1] === 'enum'
    ) {
      // Handles the general enum case
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new DropDownInput(
          propertyName,
          defaultValues[propertyName],
          this._schemaData.enums[propertyType],
        ),
      );
    } else if (
      typeof propertyType === 'string' &&
      propertyType.replace('[]', '') in schemaDictWithoutCommands &&
      propertyType !== this._propertyType &&
      propertyType.includes('[]')
    ) {
      // Handles the list of object case
      const complexInput = new ListOfObject(
        propertyName,
        propertyType.replace('[]', ''),
        this._playbookHandler,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (typeof propertyType === 'object' && Object.values(propertyType)[0] === 'variable') {
      // Handles step_variable and playbook_variables
      const complexInput = new DictionaryVariable(
        propertyName,
        Object.values(propertyType)[0] as string,
        this._playbookHandler,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
        () => {
          this.reloadProperties(this._isAgentTarget);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (
      typeof propertyType === 'object' &&
      propertyType[0] === 'string' &&
      propertyType[1] === 'null'
    ) {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new TextFieldInput(propertyName, defaultValues[propertyName]),
      );
    } else if (propertyType === 'any') {
      // Handles the value variable for step variable
      // Nevermind, actually seems to only handle 'variables' from the StatusElement
      const complexInput = new DictionaryVariable(
        propertyName,
        'variable',
        this._playbookHandler,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
        () => {
          this.reloadProperties(this._isAgentTarget);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (
      typeof propertyType === 'string' &&
      propertyType in schemaDictWithoutCommands &&
      propertyType !== this._propertyType
    ) {
      // Handles properties which have only one object to populate
      const complexInput = new SingleObjectInput(
        propertyName,
        propertyType,
        this._playbookHandler,
        container,
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyType === 'signature') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new CounterSignatureInput(
          propertyName,
          propertyType,
          this._playbookHandler,
          defaultValues[propertyName],
        ),
      );
    } else {
      return false;
    }
    return true;
  }

  /**
   * Handles any type of input, depending on its name and type, and adds it to the container.
   * @param propertyName string, name of the property
   * @param propertyType string, type of the property
   * @param container HTMLElement, container to add the input to
   */
  handleLabeledInput(propertyName: string, propertyType: any, container: HTMLElement, defaultValues: any) {
    if (this._isExtension) {
      this.handleInputFromType(propertyName, propertyType, container, defaultValues);
    } else if (this._isStatus) {
      if (!this.handleWorkflowStatusInputFromName(propertyName, propertyType, container, defaultValues)) {
        this.handleInputFromType(propertyName, propertyType, container, defaultValues);
      }
    } else {
      if (!this.handleInputFromName(propertyName, propertyType, container, defaultValues)) {
        this.handleInputFromType(propertyName, propertyType, container, defaultValues);
      }
    }
  }

  handleWorkflowStatusInputFromName(propertyName: string, propertyType: any, container: HTMLElement, defaultValues: any): boolean {
    if (propertyName === 'commands_b64') {    
      const complexInput = new ListOfCommandsB64(
        propertyName,
        propertyType,
        container,
        (name: string, value: boolean) => {
          this.setDisplayed(name, value);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName === 'notes') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new TextAreaInput(propertyName, defaultValues[propertyName]),
      );
    } else if (propertyName === 'status') {
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new DropDownInput(
          propertyName,
          defaultValues[propertyName],
          this._schemaData.enums[propertyType],
          false,
        ),
      );
    } else if (propertyName === 'executed_by') {
      const complexInput = new ExecutedStatus(
        propertyName,
        propertyType,
        this._playbookHandler,
        container,
        (a: any) => {
          this.reloadProperties(this._isAgentTarget, a);
        },
      );
      complexInput.setDefaultValues(defaultValues[propertyName]);
      this._elements.push(complexInput);
    } else if (propertyName === 'automated_execution') {
      const optionList = ['false', 'true'];
      // we use toString to defaultValues[propertyName] because it's a boolean. ExecutionStatus.ts handles casting it back to a boolean
      this.createLabeledInput(
        propertyName,
        propertyType,
        container,
        new DropDownInput(propertyName, defaultValues[propertyName].toString(), optionList, false),
      );
    } else {
      return false;
    }

    return true;
  }

  /**
   * Creates a LabeledInput containing a BasicInput
   * @param propertyName string
   * @param propertyType string
   * @param container HTMLElement
   * @param basicInput BasicInput
   */
  createLabeledInput(propertyName: string, propertyType: string, container: HTMLElement, basicInput: BasicInput, extraclass = '') {
    const description =
      this._schemaData?.descriptions?.[propertyName]
        ? this._schemaData.descriptions[propertyName]
        : '';
    const labeledInput = new LabeledInput(propertyName, container, description);
    if (extraclass !== '') {
      labeledInput.addClass(extraclass);
    }
    labeledInput.setBasicInput(basicInput);
    this._elements.push(labeledInput);
  }

  /**
   * Uses the JSON schema to create all the elements to be displayed, and sort them
   */
  addAllElementsFromSchema() {
    this._propertiesParentContainer = document.createElement('div');
    this._propertiesParentContainer.classList.add('sidepanel__container');
    this._propertiesContainer = document.createElement('div');
    this._propertiesContainer.classList.add('sidepanel__section');
    if (this._wrapper) {
      this._wrapper.appendChild(this._propertiesParentContainer);
    } else {
      this._container.appendChild(this._propertiesParentContainer);
    }
    if (this._showActionButtons) {
      this._container.appendChild(this._buttonContainer);
    }
    if (this._propertyKey) {
      this.addPropertyKey();
    }
    this.addSpecificProperties();
    this.addCommonProperties();
    this._propertiesParentContainer.appendChild(this._propertiesContainer);
    this._elements.sort((a, b) => {
      const indexA = a instanceof PanelInput ? orderInputList.indexOf(a._propertyName) : -1;
      const indexB = b instanceof PanelInput ? orderInputList.indexOf(b._propertyName) : -1;

      if (indexA === -1 && indexB === -1) {
        // Preserve the original order if both elements are not in listB
        return 0;
      } else if (indexA === -1) {
        // Put elements not in listB at the end of the list
        return 1;
      } else if (indexB === -1) {
        // Put elements not in listB at the end of the list
        return -1;
      }

      // Sort based on the order in listB
      return indexA - indexB;
    });

    this.setProperties();
  }

  addPropertyKey() {
    if (this._keyType === 'string' && this._propertyKey) {
      const textInput = new TextFieldInput(this._propertyKey, this._keyValue ? this._keyValue : '');
      if (this._propertyKey === 'variable') {
        textInput.placeHolder = '__variable__';
      }
      const description =
        this._schemaData?.descriptions?.[this._propertyKey]
          ? this._schemaData.descriptions[this._propertyKey]
          : '';
      this._keyInput = new LabeledInput(this._propertyKey, this._propertiesContainer, description);
      this._keyInput.setBasicInput(textInput);
      this._keyInput.setRequired(true);
    }
  }

  /**
   * Adds the properties inputs to the container. It doesn't manage title and other other element except the properties.
   */
  addDifferentProperties() {
    const props = document.createElement('div');
    this.handleLabeledInput(this._propertyType, this._propertyType, props, this._defaultValues);

    const headerSection = document.createElement('div');
    headerSection.classList.add('sidepanel__section');
    headerSection.classList.add('section--header');
    headerSection.classList.add(`${this._propertyType?.replace(/ /g, '_')}--color`);

    const title = new TitleInput('title', this._propertyType, headerSection, false);
    title.addClass('header__title');
    title.addToContainer();

    this._container.appendChild(headerSection);
    this._container.appendChild(props);
    this._container.appendChild(this._buttonContainer);

    this.setProperties();
  }

  /**
   * Applies the function addContainer for every PanelElement from the list _elements.
   * Handles if "list of" are required and currently displaied
   */
  setProperties() {
    if (this._keyInput) {
      this._keyInput.addToContainer();
    }
    this._elements.forEach(element => {
      const temp = element.name();
      if (this._elementsDisplay[temp]) {
        element.setDisplayed(this._elementsDisplay[temp]);
      } else {
        this._elementsDisplay[temp] = true;
        element.setDisplayed(true);
      }
      if (
        element instanceof PanelInput &&
        this._schemaData.required.includes(element._propertyName)
      ) {
        element.setRequired(true);
      }
      if (element instanceof PanelInput && !this._isSubPanel) {
        element.setUpdate(() => {
          this._playbookHandler.setPlaybookProperties(this.submit(), this._stepId);
          this._notifyFunction();
        });
      }
      if (element instanceof ComplexInput) {
        if (this._schemaData.descriptions && this._schemaData.descriptions[element.name()]) {
          element.setDescription(this._schemaData.descriptions[element.name()]);
        }
      }
      element.addToContainer();
    });
  }

  reloadStatus() {
    if (this._stepId && this.hasStatus()) {
      const lastStatus = this._statusDefaultValues;
      if (lastStatus?.step_results) {
        lastStatus.step_results[this._stepId] = this._statusInput.submit();
      }
      this._statusContainer.innerHTML = '';
      this.addStatus();
    }
  }

  /**
   * Gets the list of default values for extension properties from definition obects
   * @param propertyName
   * @returns a list of string or identifier
   */
  getDefaultList(propertyName: string) {
    return (this._defaultValues as any)[propertyName]
      ? Object.keys((this._defaultValues as any)[propertyName])
      : [];
  }

  /**
   * Closes the property panel.
   */
  close() {
    const tagName = this._container.tagName.toLowerCase();
    if (tagName === 'div' && !this._isSubPanel) {
      this._container.classList.remove('sidepanel--open');
      this._container.classList.add('sidepanel--close');
    } else if (tagName === 'dialog') {
      const dialogContainer: HTMLDialogElement = this._container as HTMLDialogElement;
      dialogContainer.close();
    }
  }

  /**
   * Quits a property panel without saving changes and getting previous values
   */
  cancel() {
    if (!this._isSubPanel) {
      this._playbookHandler.setPlaybookProperties(this._previousPanel, this._stepId);
    }
    if (this.hasStatus()) {
      this._playbookHandler.setExecutionStatus(this._previousStatus);
    }
    this._notifyFunction();
    this.close();
  }

  /**
   * Retrieves all the values from the inputs to return them, and closes the panel.
   * @returns object
   */
  confirm() {
    const obj: any = {};
    for (const panelElement of this._elements) {
      if (panelElement instanceof PanelInput) {
        const temp = panelElement.submit();
        if (temp !== undefined) {
          obj[panelElement._propertyName] = panelElement.submit();
        }
      }
    }
    if (this._isSubPanel) {
      this.close();
      return obj;
    }
    this._playbookHandler.setPlaybookProperties(obj, this._stepId);
    if (this.hasStatus() && this._stepId && this._playbookHandler.hasExecutionStatus()) {
      const lastExecutionStatus = this._playbookHandler.getExecutionStatus();
      if (lastExecutionStatus.step_results) {
        lastExecutionStatus.step_results[this._stepId] = this._statusInput.submit();
      }
    }
    this.close();
  }

  /**
   * Retrieves all the values from the inputs to return them.
   * @returns object
   */
  submit() {
    const obj: any = {};
    for (const panelElement of this._elements) {
      if (panelElement instanceof PanelInput) {
        const temp = panelElement.submit();
        if (temp !== undefined) {
          obj[panelElement._propertyName] = panelElement.submit();
        }
      }
    }
    return obj;
  }

  setNotifyFunction(notify: any) {
    this._notifyFunction = notify;
  }

  /**
   * Stores inside a list if and list property is currently displayed
   * @param propertyName
   * @param value boolean: if the list is open/displayed
   */
  setDisplayed(propertyName: string, value: boolean) {
    this._elementsDisplay[propertyName] = value;
  }

  /**
   * Reloads the panel and changes its propertyType.
   * @param newPropertyType string
   */
  reloadProperties(
    isNotCommand?: boolean,
    newPropertyType?: string,
    shouldUpdateValues = false,
    newValues = {},
  ) {
    if (newPropertyType !== undefined) {
      this._propertyType = newPropertyType;
    }
    this._schemaData = this.extractSchemaFromType(this._propertyType);
    // Save the scroll position
    const scrollPosition = this._subContainer.scrollTop;
    this._container.innerHTML = '';
    if (shouldUpdateValues) {
      this._defaultValues = newValues;
    } else {
      this._defaultValues = this.submit();
    }
    this._elements = this._elements.filter(element => element instanceof PanelButton);
    this.addAllProperties();
    if (this.hasStatus()) {
      this.reloadStatus();
    }
    this._subContainer.scrollTop = scrollPosition;
  }

  /**
   * Refreshes a property panel without default value
   * It is used mostely to add some definition outside the definition property
   * @param newPropertyType string: the propertyType of the property panel
   */
  reloadClearedProperties(newPropertyType: string) {
    this._propertyType = newPropertyType;
    this._schemaData = this.extractSchemaFromType(newPropertyType);
    this._container.innerHTML = '';
    this._defaultValues = {};
    this._elements = this._elements.filter(element => element instanceof PanelButton);
    this.addAllProperties();
  }

  /**
   * Refreshes a property panel without personalised default value
   * @param newPropertyType string: the propertyType of the property panel
   * @param defaultValue the personalised default value
   */
  reloadClearedDifferentProperties(newPropertyType: string, defaultValue: any) {
    this._propertyType = newPropertyType;
    this._container.innerHTML = '';
    this._defaultValues = defaultValue;
    this._elements = this._elements.filter(element => element instanceof PanelButton);
    this.addDifferentProperties();
  }

  private extractSchemaFromType(type: string): Schema {
    if (this._isAgentTarget) {
      return schemaDictWithoutCommands[type] !== undefined
        ? extractSchemaTypes(schemaDictWithoutCommands[type], schemaDictWithoutCommands)
        : { required: [] };
    }
    return schemaDictWithoutAgentTarget[type] !== undefined
      ? extractSchemaTypes(schemaDictWithoutAgentTarget[type], schemaDictWithoutAgentTarget)
      : { required: [] };
  }
}
