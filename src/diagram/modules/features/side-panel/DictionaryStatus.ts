import type PlaybookHandler from '../../model/PlaybookHandler';
// import type { BasicInput } from './BasicInput';
import { StatusInput } from './BasicInputs/StatusInput';
import { ItemInput } from './ItemInput';
import { PanelButton } from './PanelButton';
import { ComplexInput } from './ComplexInput';
import type { StatusElement } from '../../model/status/status-model/ExecutionStatus';
// import type { ExecutionStatus, StatusElement } from '../../model/status/status-model/ExecutionStatus';

/**
 * The class which handles the definition properties.
 * The keys are displayed inside the list from the ListInput.
 */
export class DictionaryStatus extends ComplexInput {
  _playbookHandler: PlaybookHandler;
  _statusInput!: StatusInput;
  _defaultValues: Array<StatusElement> = [];
  _elements: Array<ItemInput> = [];
  _list!: HTMLElement;
  _addFunction!: any;
  _refreshFunction: any;
  _stepId!: string;

  constructor(propertyName: string, propertyType: string, playbookHandler: PlaybookHandler, container: HTMLElement, refreshFunction: any) {
    super(propertyName, propertyType, container);
    this._playbookHandler = playbookHandler;
    this._refreshFunction = refreshFunction;
    this._container.classList.add('executionstatus__container');
    //console.log('DictionaryStatus -> constructor -> this._playbookhandler.executionstatus(): ', this._playbookHandler.getExecutionStatus());
  }

  addToContainer(): void {
    const globalDiv = document.createElement('div');
    globalDiv.classList.add('section__property', 'property--complexe');

    this._list = document.createElement('div');
    this._list.classList.add('property__dict');

    for (const statusElement of this._defaultValues) {
      this.addElement(statusElement);
    }

    const labelHeader = document.createElement('div');
    labelHeader.classList.add('label--complexe');

    this.setAddFunction();
    const addButton = new PanelButton('+', labelHeader, this._addFunction);
    addButton.addClass('label__adder');
    addButton.addClass('adder__executionStatus');
    addButton.addToContainer();

    globalDiv.appendChild(labelHeader);
    globalDiv.appendChild(this._list);
    this._container.appendChild(globalDiv);
  }

  /**
   * Add an element to the list.
   * @param statusElement to be added to the elements list.
   */
  addElement(statusElement: any) {
    const baseInputName = this._propertyName + this._elements.length;
    const itemInput = new ItemInput(baseInputName, this._list);
    itemInput.setUpdate(() => {
      this._updateFunction();
      this._refreshFunction();
    });
    // Create the status input (BasicInput)
    this._statusInput = new StatusInput(baseInputName, statusElement, this._playbookHandler, this._propertyType, this._refreshFunction, this._stepId)
    itemInput.setBasicInput(this._statusInput);
    this._elements.push(itemInput);
    itemInput.addToContainer();
  }

  setAddFunction(): void {
    this._addFunction = () => {
      this.addElement({});
      this._statusInput.showPanel();
    };
  }

  setDefaultValues(defaultValues: Array<StatusElement>): void {
    this._defaultValues = defaultValues;
    if (Array.isArray(this._defaultValues)) {
      this._defaultValues.sort(timeStampSort);
    }
  }

  setStepId(stepId: string) {
    this._stepId = stepId;
  }

  submit() {
    const list: any = [];
    for (const element of this._elements) {
      const result = element.submit();
      if (result) list.push(result)
    }
    return list;
  }
}

function timeStampSort(a: any, b: any) {
  const date1 = new Date(a.started);
  const date2 = new Date(b.started);
  if (Number.isNaN(date1.getTime()) && Number.isNaN(date2.getTime())) {
    // Invalid date strings provided
    return 0;
  }
  // To compare two dates, you can directly use comparison operators
  if (date1 > date2) {
    return -1; // date1 is earlier than date2
  } if (date1 < date2) {
    return 1; // date1 is later than date2
  }
  return 0; // date1 and date2 are equal
}
