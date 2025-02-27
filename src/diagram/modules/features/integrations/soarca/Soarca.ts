import type PlaybookHandler from '../../../model/PlaybookHandler';
import CacaoUtils from '../../../core/CacaoUtils';
import type { ActionStep, Playbook } from 'lib/cacao2-js';
import Ajv2019 from 'ajv/dist/2019';
import draft7MetaSchema from 'ajv/dist/refs/json-schema-draft-07.json';
import { schemaDictAgentTarget, schemaDictWithoutAgentTarget } from './../../../model/SchemaTypes';
import type { Schema } from 'css-minimizer-webpack-plugin';
import type IntegrationLog from '../../integration-logs/IntegrationLog';
import { ExecutionStatus, type StatusElement } from '../../../../../diagram/modules/model/status/status-model/ExecutionStatus';
import type { Identifier } from 'lib/cacao2-js/src/data-types/Identifier';


const SOARCA_END_POINT = process.env.SOARCA_END_POINT || '';
const SOARCA_INTEGRATION_TITLE = 'SOARCA Integration v0.2.0';
const PING_SOARCA_BUTTON_TEXT = 'Ping SOARCA';
const SOARCA_INFO_TEXT = `This is the alpha version of the SOARCA integration. 
Certain limitations exist: 
- Accepts only soarca_ssh and soarca_http-api agents.
- No support for out_args
- Only string variables are accepted.
- Only == and != operators are supported.
Triggering the playbook will set its created and modified timestamps
if not set.`;

const DOMAIN_PORT_REGEX =
	/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})|(^https?:\/\/localhost:[0-9]{1,5}\/?([-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/gi;

export default class Soarca {
	private _playbookHandler: PlaybookHandler;
	private _soarcaUrl: string;
	private _playbook: Playbook;
	private _soarcaIntegrationTitle: string;
	private _pingSoarcaButtonText: string;
	private _soarcaInfoText: string;
	private _domainPortRegEx: RegExp;
	private _integrationLog: IntegrationLog;
	static $inject: string[];

	constructor(playbookHandler: PlaybookHandler) {
		this._playbookHandler = playbookHandler;
		this._playbook = Object.assign({}, this._playbookHandler.playbook);
		this._soarcaUrl = SOARCA_END_POINT;
		this._soarcaIntegrationTitle = SOARCA_INTEGRATION_TITLE;
		this._pingSoarcaButtonText = PING_SOARCA_BUTTON_TEXT;
		this._soarcaInfoText = SOARCA_INFO_TEXT;
		this._domainPortRegEx = DOMAIN_PORT_REGEX;
		this._integrationLog = playbookHandler.getIntegrationLog();
	}

	/**
	 * Shows the integration dialog.
	 */
	showDialog() {
		const dialog = document.createElement('dialog') as HTMLDialogElement;
		dialog.classList.add('dialog', 'integration');
		dialog.addEventListener('keydown', this._handleDialogKeydown.bind(this, dialog));
		document.body.appendChild(dialog);

		// Building the structure of the SOARCA integration dialog
		this._buildSoarcaIntegrationDialog(dialog);

		// Cache DOM elements
		const soarcaUrlInput = dialog.querySelector('#soarca-end_point-input') as HTMLInputElement;
		const pingSoarca = dialog.querySelector('#ping-soarca') as HTMLButtonElement;
		const statusIcon = dialog.querySelector('.ping_status_icon') as HTMLSpanElement;
		const statusText = dialog.querySelector('.ping_status_text') as HTMLSpanElement;
		const triggerPlaybook = dialog.querySelector(
			'#soarca-trigger-playbook',
		) as HTMLButtonElement;
		const cancel = dialog.querySelector('#soarca-cancel') as HTMLButtonElement;

		// Listen to changes in the soarca url input, removing the ping status when changed.
		soarcaUrlInput.addEventListener('input', () => this._removePingStatus());

		// Pinging SOARCA and displaying the status
		pingSoarca.addEventListener('click', () => {
			this._pingSoarca(statusIcon, statusText);
		});

		document.body.classList.add('blurred');
		dialog.showModal();

		return new Promise<boolean>(resolve => {
			// Adding event listeners to the trigger Playbook button
			triggerPlaybook.addEventListener('click', () => {
				let noErrors = true;
				this._soarcaAgentsPreparationPOC();

				// Get the soarca url and error message elements
				this._soarcaUrl = (
					document.getElementById('soarca-end_point-input') as HTMLInputElement
				).value;
				const soarcaInputError = document.getElementById('soarca-end_point-error') as HTMLSpanElement;
				const playbookError = document.getElementById('playbook-error-message') as HTMLSpanElement;

				// Check if populated and validate soarca url
				if (!this._domainPortRegEx.test(this._soarcaUrl) && this._soarcaUrl !== '') {
					noErrors = false;
					soarcaInputError.innerHTML = 'Provided input is not a valid URL.';
					soarcaInputError.classList.remove('hidden');
				} else if (this._soarcaUrl === '') {
					noErrors = false;
					soarcaInputError.innerHTML = 'This field is required.';
					soarcaInputError.classList.remove('hidden');
				} else soarcaInputError.classList.add('hidden');

				// validate the playbook, if not valid show error message
				if (!this._validatePlaybook()) {
					noErrors = false;
					playbookError.innerText =
						'Only valid playbook can be send. Please check the error messages in the bottom-left corner.';
					playbookError.classList.remove('hidden');
				} else playbookError.classList.add('hidden');

				// Trigger the playbook and remove the dialog
				if (noErrors) {
					this._triggerPlaybook();
					dialog.close();
					dialog.remove();
					document.body.classList.remove('blurred');
					resolve(true);
				}
			});

			// close the dialog
			cancel.addEventListener('click', () => {
				dialog.close();
				dialog.remove();
				document.body.classList.remove('blurred');
				resolve(false);
			});
		});
	}

	// The HTML structure of the SOARCA integration dialog - aka view
	private _buildSoarcaIntegrationDialog(dialog: HTMLDialogElement) {
		dialog.innerHTML = `
      <h1 class="dialog__title">${this._soarcaIntegrationTitle}</h1>

      <div class="dialog__property">
        <label class="property__label" for="soarca-end_point-input">SOARCA end point</label>
        <input class="property__input" id="soarca-end_point-input" name="soarca-end_point-input" value="${process.env.SOARCA_END_POINT || ''}" oninput="${this._removePingStatus()}" >
        <div class="messagePingContainer">
          <div>
            <span class="error_message hidden" id="soarca-end_point-error"></span>
          </div>  
          <div class="dialog__buttonList">
            <span class="ping_status_icon"></span>
            <span class="ping_status_text"></span>
            <button id="ping-soarca" class="dialog__button button--primary">${this._pingSoarcaButtonText}</button>
          </div>
        </div>
      </div>

      <div class="dialog__property">
        <label class="property__label" for="soarca-integration-input">Limitations</label>
        <textarea class="property__input" readonly>${this._soarcaInfoText}</textarea>
      </div>

      <div class="dialog__buttonList">
        <div class="error_message-div">
          <span class="error_message hidden" id="playbook-error-message"></span>
        </div>
        <button id="soarca-cancel" class="dialog__button button--secondary">Cancel</button>
        <button id="soarca-trigger-playbook" class="dialog__button button--primary">Trigger Playbook</button>
      </div>
    `;
	}

	private _handleDialogKeydown(dialog: HTMLDialogElement, event: KeyboardEvent): void {
		if (event?.code?.toLowerCase() === 'escape') {
			dialog.close();
			dialog.remove();
			document.body.classList.remove('blurred');
		}
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
		const isValid = ajv.validate(
			schemaDictWithoutAgentTarget.playbook,
			CacaoUtils.filterEmptyValues(this._playbookHandler.playbook),
		);
		//console.log('Schema errors: ', ajv.errors);
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

	/**
	 * Pings the SOARCA endpoint and updates the status.
	 * @param statusIcon The status icon element.
	 * @param statusText The status text element.
	 */
	private _pingSoarca = (statusIcon: HTMLSpanElement, statusText: HTMLSpanElement) => {
		this._soarcaUrl = (
			document.getElementById('soarca-end_point-input') as HTMLInputElement
		)?.value.trim();
		const pingSoarcaButton = document.getElementById('ping-soarca') as HTMLButtonElement;
		pingSoarcaButton.innerHTML = 'Checking...';
		setTimeout(() => {
			this._integrationLog.addUserLogItem('Ping SOARCA', '');
			fetch(`${this._soarcaUrl}/status/ping`)
				.then(response => {
					if (response.status === 200) {
						statusIcon.classList.remove('ping_status_icon--error');
						statusIcon.classList.add('ping_status_icon--success');
						statusText.innerText = 'Alive';
						this._integrationLog.addSystemLogItem(
							'SOARCA is alive',
							`${response.statusText} ${response.status}`,
						);
					} else {
						statusIcon.classList.remove('ping_status_icon--success');
						statusIcon.classList.add('ping_status_icon--error');
						statusText.innerText = 'Not responding';
						this._integrationLog.addSystemLogItem(
							'SOARCA is not responding',
							`${response.statusText} ${response.status}`,
						);
					}
				})
				.catch(error => {
					statusIcon.classList.remove('ping_status_icon--success');
					statusIcon.classList.add('ping_status_icon--error');
					statusText.innerText = 'Not responding';
					this._integrationLog.addSystemLogItem(
						'SOARCA is not responding',
						error.message,
					);
				});
			pingSoarcaButton.innerText = this._pingSoarcaButtonText;
		}, 300);
	};

	private _removePingStatus() {
		const statusIcon = document.querySelector('.ping_status_icon') as HTMLSpanElement;
		const statusText = document.querySelector('.ping_status_text') as HTMLSpanElement;
		if (statusIcon && statusText) {
			statusIcon.classList.remove('ping_status_icon--success', 'ping_status_icon--error');
			statusText.innerText = '';
		}
	}

	private _triggerPlaybook() {
		this._integrationLog.addUserLogItem(
			'Trigger Playbook',
			`Triggering playbook with playbook id: ${this._playbook.id}`,
		);
		fetch(`${this._soarcaUrl}/trigger/playbook`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(CacaoUtils.filterEmptyValues(this._playbook)),
		})
			.then(response => {
				//console.log('Response: ', response);
				if (response.status === 200) {
					return response.json();
				}
			})
			.then(data => {
				console.log('Successfully Triggered Playbook with ID: ', this._playbook.id);
				const executionID = (data as ExecutionStatus).execution_id;
				console.log('The triggeren playbook got the following Execution ID: ', executionID);
				this._integrationLog.addSystemLogItem(
					'Playbook sent for execution',
					`Execution ID: ${executionID}`,
				);
				this._triggerExecutionStatusChecks(executionID);
			})
			.catch(error => {
				console.error('Error while triggering the playbook:', error);
				this._integrationLog.addSystemLogItem('Failed to trigger playbook', error.message);
			});
	}

	// Changing the soarca agents and their references through the playbook
	private _soarcaAgentsPreparationPOC() {
		const soarcaSshAgentID = 'soarca--00010001-1000-1000-a000-000100010001';
		const soarcaHttpApiAgentID = 'soarca--00020001-1000-1000-a000-000100010001';
		this._playbook = Object.assign({}, this._playbookHandler.playbook);

		const agentDictionary = this._playbook.agent_definitions;

		for (const agentID in agentDictionary) {
			if (agentID?.includes('soarca-ssh')) {
				agentDictionary[agentID].type = 'soarca';
				agentDictionary[agentID].name = 'soarca-ssh';
				agentDictionary[soarcaSshAgentID] = agentDictionary[agentID];
				delete agentDictionary[agentID];
			} else if (agentID?.includes('soarca-http-api')) {
				agentDictionary[agentID].type = 'soarca';
				agentDictionary[agentID].name = 'soarca-http-api';
				agentDictionary[soarcaHttpApiAgentID] = agentDictionary[agentID];
				delete agentDictionary[agentID];
			}
		}
		const workflowSteps = this._playbookHandler.playbook.workflow;
		for (const workflow in workflowSteps) {
			if (workflow?.includes('action--')) {
				const actionStep = workflowSteps[workflow] as ActionStep;
				if (actionStep.agent?.includes('soarca-ssh')) {
					actionStep.agent = soarcaSshAgentID;
					this._playbookHandler.playbook.workflow[workflow] = actionStep;
				} else if (actionStep.agent?.includes('soarca-http-api')) {
					actionStep.agent = soarcaHttpApiAgentID;
					this._playbookHandler.playbook.workflow[workflow] = actionStep;
				}
			}
		}
		this._playbook.agent_definitions = agentDictionary;
		this._playbookHandler.setPlaybookDates();
	}

	private async _checkExecutionStatus(executionID: string): Promise<ExecutionStatus> {
		return fetch(`${this._soarcaUrl}/reporter/${executionID}`, {
			method: 'GET',
			headers: {
				accept: 'application/json',
			},
		})
			.then(response => {
				console.log('Response of the reporter module for execution status: ', response);
				if (response.status === 200) {
					return response.json();
				}
				throw new Error('Failed to get execution status');
			})
			.then(data => {
				if (!data) throw new Error('The execution stats is empty');
				this._integrationLog.addSystemLogItem(
					`Retrieving Execution Status with ID: ${executionID}`,
					JSON.stringify(data),
				);

				console.log('Execution Status: ', data);
				// Parsing the step results objects and pushing it to the stepResults object array
				const stepResults: Record<Identifier, Array<StatusElement>> = {};
				for (const [key, value] of Object.entries(data.step_results as Record<Identifier, StatusElement>)) {
					if (!stepResults[key]) {
						stepResults[key] = [];
					}
					stepResults[key].push(value);
				}
				data.step_results = stepResults;
				console.log('DATA OBJECT AFTER MANIPULATION: ', data);

				const executionStatus = new ExecutionStatus(data);
				console.log('Execution Status OBJECT: ', executionStatus);
				console.log('Playbook stored execution status: ', this._playbookHandler.getExecutionStatus());
				// If the execution status already exists, update it, otherwise add it
				if (this._playbookHandler.isTheSameExecutionStatus(executionStatus.execution_id)) {
					this._playbookHandler.updateExistingExecutionStatus(executionStatus);
				} else {
					this._playbookHandler.setExecutionStatus(executionStatus);
				}

				console.log('Playbook stored execution status AFTER UPDATE: ', this._playbookHandler.getExecutionStatus());

				return executionStatus;
			})
			.catch(error => {
				console.error(`Failed to get execution status for execution ID: ${executionID}`);
				this._integrationLog.addSystemLogItem(
					'Failed to get execution status',
					error.message,
				);
				return new ExecutionStatus({
					status: 'server_side_error',
					execution_id: executionID,
				});
			});
	}

	private async _triggerExecutionStatusChecks(executionID: string) {
		let executionResponse: ExecutionStatus;
		do {
			//console.log('Checking Execution Status - first call')
			executionResponse = await this._checkExecutionStatus(executionID)
				.then(data => {
					//console.log('Execution Status: ', data);
					if (data?.status === 'successfully_executed') {
						this._integrationLog.addSystemLogItem(
							'Playbook Execution Completed!',
							`Playbook ID: ${this._playbook.id}, Execution ID: ${executionID}`,
						);
					}
					return data as ExecutionStatus;
				})
				.catch(error => {
					//console.error('Error while checking the execution status:', error);
					this._integrationLog.addSystemLogItem(
						'Failed to get execution status',
						error.message,
					);
					return new ExecutionStatus({
						status: 'server_side_error',
						execution_id: executionID,
					});
				});
			await new Promise(resolve => setTimeout(resolve, 5000));
		} while (executionResponse.status === 'ongoing');
	}
}

Soarca.$inject = ['playbookHandler', 'config.container', 'eventBus', 'elementRegistry', 'Utils'];
