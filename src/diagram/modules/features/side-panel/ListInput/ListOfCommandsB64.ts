import { BasicInput } from '../BasicInput';
import { CommandInput } from '../BasicInputs/CommandInput';
import { ListInput } from '../ListInput';

/**
 * A ListOfCommandsB64 is a ListInput containing multiple CommandInputs set to base64.
 */
export class ListOfCommandsB64 extends ListInput {
  setDefaultValues(defaultValues: any): void {
    this._defaultValues = defaultValues;
  }

  createBasicInput(name: string, value: string): BasicInput {
    const commandInput = new CommandInput(name, value)
    commandInput.setIsBase64(true);
    return commandInput;
  }

  setAddFunction(): void {
    this._addFunction = () => {
      this.addElement('');
    };
  }

  addToContainer(){
    //Adds the "displayed in plaintext" small label
    super.addToContainer()
    const propertyLabel = this._bodyListContainer.querySelector('.property__label');
    propertyLabel?.classList.add('label__b64')
  }
}
