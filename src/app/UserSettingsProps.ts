import type { Identifier } from 'lib/cacao2-js/src/data-types/Identifier';
import { v4 as uuidv4 } from 'uuid';

export default class UserSettingsProps {
	static instance: UserSettingsProps = new UserSettingsProps();

	identifier: Identifier = this.getOrCreateUserIdentifier;
	private identifierPattern =
		'^[a-z][a-z0-9-]+[a-z0-9]--[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$';
	privateKey = '';
	publicKey = '';

	get isSigningInfoFilledIn(): boolean {
		return this.isIdValid && this.isKeyPairValid;
	}

	get isIdValid(): boolean {
		return this.passRegex(this.identifier);
	}

	get isKeyPairValid(): boolean {
		return this.privateKey.includes('-----BEGIN ') && this.publicKey.includes('-----BEGIN ');
	}

	get getOrCreateUserIdentifier(): Identifier {
		return (process.env.USER_IDENTIFIER as Identifier) || `identity--${uuidv4()}`;
	}

	showDialog() {
		const dialog = document.createElement('dialog') as HTMLDialogElement;
		dialog.className = 'dialog';
		dialog.addEventListener('keydown', event => {
			if (event.code.toLowerCase() === 'escape') {
				dialog.close();
				dialog.remove();
				document.body.classList.remove('blurred');
			}
		});
		document.body.appendChild(dialog);

		dialog.appendChild(this.getTitleHTMLElement());

		const identifierContainer = this.getPropertyHTMLElement(
			'User identifier',
			'identifier',
			'input',
			this.identifier,
		);
		dialog.appendChild(identifierContainer);
		const privateKeyContainer = this.getPropertyHTMLElement(
			'Private key (beta - for experimental purposes only)',
			'privateKey',
			'textarea',
			this.privateKey,
		);
		dialog.appendChild(this.demoKeyPairDiv());
		dialog.appendChild(privateKeyContainer);
		const publicKeyContainer = this.getPropertyHTMLElement(
			'Public key (beta - for experimental purposes only)',
			'publicKey',
			'textarea',
			this.publicKey,
		);
		dialog.appendChild(publicKeyContainer);

		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'dialog__buttonList';

		const confirm = this.getButtonHTMLElement('Confirm', true);
		const cancel = this.getButtonHTMLElement('Cancel', false);

		buttonContainer.appendChild(cancel);
		buttonContainer.appendChild(confirm);
		dialog.appendChild(buttonContainer);

		document.body.classList.add('blurred');
		dialog.showModal();

		return new Promise<boolean>(resolve => {
			confirm.addEventListener('click', () => {
				const identifier = identifierContainer.getElementsByClassName(
					'property__input',
				)[0] as HTMLInputElement;
				const publicKey = publicKeyContainer.getElementsByClassName(
					'property__input',
				)[0] as HTMLTextAreaElement;
				const privateKey = privateKeyContainer.getElementsByClassName(
					'property__input',
				)[0] as HTMLTextAreaElement;

				let correct = true;
				if (!this.passRegex(identifier.value)) {
					correct = false;
					identifier.classList.add('input--incorrect');
				} else {
					identifier.classList.remove('input--incorrect');
				}
				if (correct) {
					this.identifier = identifier.value;
					this.publicKey = publicKey.value;
					this.privateKey = privateKey.value;
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

	passRegex(value: string): boolean {
		const reg = RegExp(this.identifierPattern);
		return value === '' || reg.test(value);
	}

	getTitleHTMLElement(): HTMLElement {
		const titleDialog = document.createElement('div') as HTMLDivElement;
		titleDialog.innerHTML = 'Settings';
		titleDialog.className = 'dialog__title';
		return titleDialog;
	}

	getPropertyHTMLElement(
		label: string,
		id: string,
		type: 'textarea' | 'input',
		value = '',
	): HTMLElement {
		const propertyContainer = document.createElement('div');
		propertyContainer.className = 'dialog__property';
		propertyContainer.id = id;

		const labelElement = document.createElement('div');
		labelElement.innerHTML = label;
		labelElement.className = 'property__label';

		const inputElement = document.createElement(type);
		inputElement.className = 'property__input';
		inputElement.id = `${id}-${type}`;
		inputElement.value = value;

		propertyContainer.appendChild(labelElement);
		propertyContainer.appendChild(inputElement);
		return propertyContainer;
	}

	getButtonHTMLElement(label: string, isPrimary = true): HTMLElement {
		const button = document.createElement('button');
		button.className = 'dialog__button';
		button.innerText = label;

		if (isPrimary) {
			button.classList.add('button--primary');
		} else {
			button.classList.add('button--secondary');
		}

		return button;
	}

	loadDemoKeyPair() {
		this.privateKey = process.env.PRIVATE_KEY || '';
		this.publicKey = process.env.PUBLIC_KEY || '';
	}

	demoKeyPairDiv(): HTMLDivElement {
		const useDemoKeysBtn = document.createElement('button');
		useDemoKeysBtn.classList.add('dialog__button', 'button--secondary');
		useDemoKeysBtn.innerText = 'Use demo keys';
		useDemoKeysBtn.addEventListener('click', () => {
			this.loadDemoKeyPair();
			const privateKeyInput = document.getElementById(
				'privateKey-textarea',
			) as HTMLTextAreaElement;
			const publicKeyInput = document.getElementById(
				'publicKey-textarea',
			) as HTMLTextAreaElement;
			privateKeyInput.value = this.privateKey;
			publicKeyInput.value = this.publicKey;
		});

		const clearDemoKeysBtn = document.createElement('button');
		clearDemoKeysBtn.classList.add('dialog__button', 'button--secondary');
		clearDemoKeysBtn.innerText = 'Clear Keys';
		clearDemoKeysBtn.addEventListener('click', () => {
			const privateKeyInput = document.getElementById(
				'privateKey-textarea',
			) as HTMLTextAreaElement;
			const publicKeyInput = document.getElementById(
				'publicKey-textarea',
			) as HTMLTextAreaElement;
			privateKeyInput.value = '';
			publicKeyInput.value = '';
		});

		const buttonWrapper = document.createElement('div');
		buttonWrapper.classList.add('keyPair__button-wrapper');
		buttonWrapper.appendChild(useDemoKeysBtn);
		buttonWrapper.appendChild(clearDemoKeysBtn);
		return buttonWrapper;
	}
}
