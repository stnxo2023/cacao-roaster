import PlaybookHandler from '../../../model/PlaybookHandler';
import CacaoUtils from '../../../core/CacaoUtils';
import { ActionStep, Playbook, WorkflowStep } from 'lib/cacao2-js';
import Ajv2019 from 'ajv/dist/2019';
import draft7MetaSchema from 'ajv/dist/refs/json-schema-draft-07.json';
import { schemaDictAgentTarget, schemaDictWithoutAgentTarget } from './../../../model/SchemaTypes';
import { Schema } from 'css-minimizer-webpack-plugin';

export default class Soarca {
  private _playbookHandler: PlaybookHandler;
  private _soarcaUrl: string = process.env.SOARCA_END_POINT || '';
  private _playbook: Playbook;
  private _soarcaInfoText = `This is a fist alpha version of the SOARCA integration. 
    Certain limitations exists: 
    - Accepts only soarca_ssh and soarca_http-api agents.
    - No support of out_args
    - Only string variables are acceptes.
    - Only == and != operators are supported.`;
  private _UrlExpresion = /^http(s*):\/\/\w+(\.\w+)*(:[0-9]+)?\/?$/;
  private _domainPortRegEx;
  static $inject: string[];

  constructor(playbookHandler: PlaybookHandler) {
    this._playbookHandler = playbookHandler;
    this._playbook = Object.assign({}, this._playbookHandler.playbook);
    this._domainPortRegEx = new RegExp(this._UrlExpresion);
  }

  showDialog() {
    let dialog = document.createElement('dialog') as HTMLDialogElement;
    dialog.classList.add('dialog', 'integration');
    dialog.addEventListener('keydown', function (event) {
      if (event?.code?.toLowerCase() === 'escape') {
        dialog.close();
        dialog.remove();
        document.body.classList.remove('blurred');
      }
    });
    document.body.appendChild(dialog);

    dialog.appendChild(this._getTitleHTMLElement());

    let identifierContainer = this._getPropertyHTMLElement(
      'SOARCA end point',
      'soraca-end_point',
      process.env.SOARCA_END_POINT || '',
    );
    dialog.appendChild(identifierContainer);
    let soarcaInfoContainer = document.createElement('div');
    let soarcaInfo = document.createElement('pre');
    soarcaInfo.className = 'integration-info';
    soarcaInfo.innerHTML = this._soarcaInfoText;
    soarcaInfoContainer.appendChild(soarcaInfo);
    dialog.appendChild(soarcaInfoContainer);

    let buttonContainer = document.createElement('div');
    buttonContainer.className = 'dialog__buttonList';

    let errorMessage = document.createElement('span');
    errorMessage.classList.add('error_message', 'hidden');
    errorMessage.id = 'playbook-error-message';
    errorMessage.innerHTML = '';
    let errorMessageDiv = document.createElement('div');
    errorMessageDiv.className = 'error_message-div';
    errorMessageDiv.appendChild(errorMessage);
    let sendAndTriggerPlaybook = this._getButtonHTMLElement('Send and Trigger Playbook', true);
    let cancel = this._getButtonHTMLElement('Cancel', false);

    buttonContainer.appendChild(errorMessageDiv);
    buttonContainer.appendChild(cancel);
    buttonContainer.appendChild(sendAndTriggerPlaybook);
    dialog.appendChild(buttonContainer);

    document.body.classList.add('blurred');
    dialog.showModal();

    return new Promise<boolean>(resolve => {
      sendAndTriggerPlaybook.addEventListener('click', () => {
        let noErrors = true;
        this._soarcaAgentsPreparationPOC();

        // Get the soarca url and error message elements
        this._soarcaUrl = (
          document.getElementById('soraca-end_point-input') as HTMLInputElement
        ).value;
        let soarcaInputError = document.getElementById('soraca-end_point-error') as HTMLSpanElement;
        let playbookError = document.getElementById('playbook-error-message') as HTMLSpanElement;

        // validate soarca url
        if (!this._domainPortRegEx.test(this._soarcaUrl) && this._soarcaUrl != '') {
          noErrors = false;
          soarcaInputError.innerHTML = 'Provided input is not a valid URL.';
          soarcaInputError.classList.remove('hidden');
        } else if (this._soarcaUrl == '') {
          noErrors = false;
          soarcaInputError.innerHTML = 'This field is required.';
          soarcaInputError.classList.remove('hidden');
        } else soarcaInputError.classList.add('hidden');

        // validate playbook
        if (!this._validatePlaybook()) {
          noErrors = false;
          playbookError.innerText =
            'Only valid playbook can be send. Please check the error messages in the corner.';
          playbookError.classList.remove('hidden');
        } else playbookError.classList.add('hidden');

        // send and trigger playbook, remove the dialog
        if (noErrors) {
          // this._sendPlaybookToSoarca();
          this._triggerPlaybook();
          dialog.close();
          dialog.remove();
          document.body.classList.remove('blurred');
          resolve(true);
        }
      });

      cancel.addEventListener('click', () => {
        dialog.close();
        dialog.remove();
        document.body.classList.remove('blurred');
        resolve(false);
      });
    });
  }

  private _validatePlaybook(): boolean {
    const ajv = new Ajv2019({
      strict: false,
      allErrors: true,
      verbose: true,
      addUsedSchema: false,
    });
    ajv.addMetaSchema(draft7MetaSchema);
    this._loadSchemas(ajv);
    let isValid = ajv.validate(
      schemaDictWithoutAgentTarget['playbook'],
      CacaoUtils.filterEmptyValues(this._playbookHandler.playbook),
    );
    console.log('Schema errors: ', ajv.errors);
    return isValid;
  }

  private _loadSchemas(avj: Ajv2019) {
    let schemas = Object.values(schemaDictWithoutAgentTarget) as Schema[];
    for (const schema of schemas) {
      avj.addSchema(schema);
    }
    schemas = Object.values(schemaDictAgentTarget) as Schema[];
    for (const schema of schemas) {
      avj.addSchema(schema);
    }
  }

  private _getTitleHTMLElement(): HTMLElement {
    let titleDialog = document.createElement('div') as HTMLDivElement;
    titleDialog.innerHTML = 'SOARCA Integration v0.1.0';
    titleDialog.className = 'dialog__title';
    return titleDialog;
  }

  private _getPropertyHTMLElement(label: string, id: string, value: string = ''): HTMLElement {
    let propertyContainer = document.createElement('div');
    propertyContainer.className = 'dialog__property';
    propertyContainer.id = id;

    let labelElement = document.createElement('label');
    labelElement.innerHTML = label;
    labelElement.className = 'property__label';
    labelElement.htmlFor = id + '-input';

    let inputElement = document.createElement('input');
    inputElement.className = 'property__input';
    inputElement.id = id + '-input';
    inputElement.value = value;
    inputElement.name = id + '-input';

    let errorMessage = document.createElement('span');
    errorMessage.classList.add('error_message', 'hidden');
    errorMessage.id = id + '-error';
    errorMessage.innerHTML = '';

    propertyContainer.appendChild(labelElement);
    propertyContainer.appendChild(inputElement);
    propertyContainer.appendChild(errorMessage);
    return propertyContainer;
  }

  private _getButtonHTMLElement(label: string, isPrimary = true): HTMLElement {
    let button = document.createElement('button');
    button.className = 'dialog__button';
    button.innerText = label;
    if (isPrimary) button.classList.add('button--primary');
    else button.classList.add('button--secondary');
    return button;
  }

  // private _sendPlaybookToSoarca() {
  //     const playbook = CacaoUtils.filterEmptyValues(this._playbook);
  //     this._soarcaUrl = (document.getElementById('soraca-end_point-input') as HTMLInputElement)?.value;

  //     fetch(this._soarcaUrl + "/playbook/", {
  //         mode: 'no-cors',
  //         method: 'POST',
  //         headers: {
  //             'Content-Type': 'application/json',
  //             'accept': 'application/json'
  //         },
  //         body: JSON.stringify(playbook),
  //     })
  //         .then((response) => response.json())
  //         .then((data) => {
  //             console.log('Success:', data);
  //             console.log('Send Playbook with ID:', this._playbook.id);
  //         })
  //         .catch((error) => {
  //             console.error('Error:', error);
  //         });
  // }

  private _triggerPlaybook() {
    console.log(
      'Triggering playbook...',
      JSON.stringify(CacaoUtils.filterEmptyValues(this._playbook)),
    );
    fetch(this._soarcaUrl + '/trigger/playbook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(CacaoUtils.filterEmptyValues(this._playbook)),
    })
      .then(response => {
        console.log('Response: ', response);
        if (response.status == 200) {
          response.json();
        }
        throw new Error('Failed to trigger playbook');
      })
      .then(data => {
        console.log('Success:', data);
        console.log('Triggered Playbook with ID: ', this._playbook.id);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  // Changing the soarca agents and their references through the playbook
  private _soarcaAgentsPreparationPOC() {
    const soarcaSshAgentID = 'soarca--00010001-1000-1000-a000-000100010001';
    const soarcaHttpApiAgentID = 'soarca--00020001-1000-1000-a000-000100010001';
    this._playbook = Object.assign({}, this._playbookHandler.playbook);

    let agentDictionary = this._playbook.agent_definitions;

    for (let agentID in agentDictionary) {
      if (agentID.includes('soarca-ssh')) {
        agentDictionary[agentID].type = 'soarca';
        agentDictionary[agentID].name = 'soarca-ssh';
        agentDictionary[soarcaSshAgentID] = agentDictionary[agentID];
        delete agentDictionary[agentID];
      } else if (agentID.includes('soarca-http-api')) {
        agentDictionary[agentID].type = 'soarca';
        agentDictionary[agentID].name = 'soarca-http-api';
        agentDictionary[soarcaHttpApiAgentID] = agentDictionary[agentID];
        delete agentDictionary[agentID];
      }
    }
    let workflowSteps = this._playbookHandler.playbook.workflow;
    for (let workflow in workflowSteps) {
      if (workflow.includes('action--')) {
        let actionStep = workflowSteps[workflow] as ActionStep;
        if (actionStep.agent.includes('soarca-ssh')) {
          actionStep.agent = soarcaSshAgentID;
          this._playbookHandler.playbook.workflow[workflow] = actionStep;
        } else if (actionStep.agent.includes('soarca-http-api')) {
          actionStep.agent = soarcaHttpApiAgentID;
          this._playbookHandler.playbook.workflow[workflow] = actionStep;
        }
      }
    }
    this._playbook.agent_definitions = agentDictionary;
    this._playbookHandler.setPlaybookDates();
  }
}

Soarca.$inject = ['playbookHandler', 'config.container', 'eventBus', 'elementRegistry', 'Utils'];
