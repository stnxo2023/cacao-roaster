import type PlaybookHandler from 'src/diagram/modules/model/PlaybookHandler';
import { BasicInput } from '../BasicInput';
import { PanelButton } from '../PanelButton';
import PropertyPanel from '../PropertyPanel';
import type { UneditableInput } from './UneditableInput';
import { v4 as uuidv4 } from 'uuid';
import {
	executionStatusColorLight,
	extractSchemaTypes,
	schemaDictWithoutCommands,
} from '../../../model/SchemaTypes';
import statusJsonSchema from '../../../../../../lib/workflow-status/schema/execution-status.json';
import { StatusElement } from '../../../model/status/status-model/ExecutionStatus';

/**
 * The input to display and edit definition properties.
 */
export class StatusInput extends BasicInput {
	_value: any;
	_variableUneditableField!: UneditableInput;
	_propertyPanel!: PropertyPanel;
	_playbookHandler: PlaybookHandler;
	_propertyType: string;
	_dialog!: HTMLDialogElement;
	_refreshFunction: any;
	_editButton!: PanelButton;

	constructor(
		inputName: string,
		initialValue: any,
		playbookHandler: PlaybookHandler,
		propertyType: string,
		refreshFunction: any,
		stepId: string,
	) {
		super(inputName, initialValue);
		if (Object.keys(initialValue).length === 0) {
			const date = new Date().toISOString();
			this._value = new StatusElement({
				started: date,
				execution_id: `execution-status--${uuidv4()}`,
				type: 'execution-status',
				step_id: stepId,
			});
		} else {
			this._value = initialValue;
		}
		this._playbookHandler = playbookHandler;
		this._propertyType = propertyType;
		this._refreshFunction = refreshFunction;
	}

	addToContainer(): void {
		this._dialog = document.createElement('dialog');
		this._dialog.className = 'list-dialog';

		this._container.appendChild(this._dialog);

		const tempValues = {};
		Object.assign(tempValues, this._value);
		this._propertyPanel = new PropertyPanel(
			this._playbookHandler,
			this._propertyType,
			this._value,
			this._dialog,
		);
		this._propertyPanel.setIsAgentTarget(false);
		this._propertyPanel.setIsSubPanel(true);

		const confirm = () => {
			Object.assign(tempValues, this._propertyPanel?.confirm());
			this._refreshFunction();
		};

		const cancel = () => {
			this._propertyPanel = new PropertyPanel(
				this._playbookHandler,
				this._propertyType,
				tempValues,
				this._dialog,
				this._value.id,
			);
			this._propertyPanel.setIsAgentTarget(false);
			this._propertyPanel._container.innerHTML = '';
			this._propertyPanel.setIsSubPanel(true);
			this._propertyPanel.setIsStatus(true);
			this._propertyPanel.addButton('Cancel', cancel);
			this._propertyPanel.addButton('Confirm', confirm);
			this._propertyPanel.setSchemaData(
				extractSchemaTypes(statusJsonSchema, schemaDictWithoutCommands),
			);
			this._propertyPanel.addAllProperties();
			this._refreshFunction();
			this._propertyPanel.close();
		};
		this._propertyPanel.setIsStatus(true);
		this._propertyPanel.setSchemaData(
			extractSchemaTypes(statusJsonSchema, schemaDictWithoutCommands),
		);
		this._propertyPanel.addButton('Cancel', cancel);
		this._propertyPanel.addButton('Confirm', confirm);

		this._propertyPanel.addAllProperties();

		this._editButton = new PanelButton(
			this._value.status ? this._value.status : 'new status',
			this._container,
			() => {
				this.showPanel();
			},
		);
		this._editButton.addClass('property__container');
		this._editButton.addClass('container--simple');
		this._editButton.addClass('container--disabled');
		this._editButton.addClass('property__status__element--button');
		this._editButton.addLine(
			this._value.status ? this._value.status.replace('_', ' ') : 'new status',
			'executionstatus__title',
		);
		if (this._value.status) {
			this._editButton.addLine(
				`start: \t${new Date(this._value.start_time).toLocaleString()}`,
				'executionstatus__content',
			);
			this._editButton._linesContainer.style.setProperty(
				'--backgroundcolor',
				executionStatusColorLight[this._value.status],
			);
		}
		this._editButton.addToContainer();
	}

	//show the definition object panel.
	showPanel() {
		this._dialog.showModal();
	}

	submit(): any {
		const temp = this._propertyPanel?.confirm();
		return temp;
	}
}
