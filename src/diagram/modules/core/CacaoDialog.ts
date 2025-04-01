export default class cacaoDialog {
	private static _container: HTMLElement = document.getElementsByTagName('body')[0];
	static $inject: string[];

	/**
	 * this method will pop up an alert dialog with just a "ok" button
	 * @param title
	 * @param description
	 * @returns
	 */
	static showAlert(title: string, description = ''): Promise<boolean> {
		const dialog = document.createElement('dialog') as HTMLDialogElement;
		dialog.className = 'cacaoDialog';
		cacaoDialog._container.appendChild(dialog);

		dialog.addEventListener('keydown', event => {
			if (event.code.toLowerCase() === 'escape') {
				event.preventDefault(); // Prevents the window from closing with the Escape key
			}
		});

		const titleDialog = document.createElement('div') as HTMLDivElement;
		titleDialog.innerHTML = title;
		titleDialog.className = 'cacaoDialog__title ';
		dialog.appendChild(titleDialog);

		const descriptionDialog = document.createElement('div') as HTMLDivElement;
		descriptionDialog.innerHTML = description;
		descriptionDialog.className = 'cacaoDialog__description';
		dialog.appendChild(descriptionDialog);

		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'cacaoDialog__buttonList';

		const buttonPrimary = document.createElement('button');
		buttonPrimary.innerText = 'Ok';
		buttonPrimary.className = 'buttonList__button button--primary';

		buttonContainer.appendChild(buttonPrimary);

		dialog.appendChild(buttonContainer);
		dialog.showModal();

		return new Promise<boolean>(resolve => {
			buttonPrimary.addEventListener('click', () => {
				dialog.close();
				dialog.remove();
				resolve(true);
			});
		});
	}

	/**
	 * this method will pop up a confirm dialog with two button to confirm or not
	 * @param title
	 * @param description
	 * @returns Boolean True if the "confirm" button was hit, false otherwise
	 */
	static showConfirm(title: string, description = ''): Promise<boolean> {
		const dialog = document.createElement('dialog') as HTMLDialogElement;
		dialog.className = 'cacaoDialog';
		cacaoDialog._container.appendChild(dialog);

		dialog.addEventListener('keydown', event => {
			if (event.code.toLowerCase() === 'escape') {
				event.preventDefault(); /// Prevents the window from closing with the Escape key
			}
		});

		const titleDialog = document.createElement('div') as HTMLDivElement;
		titleDialog.innerHTML = title;
		titleDialog.className = 'cacaoDialog__title ';
		dialog.appendChild(titleDialog);

		const descriptionDialog = document.createElement('div') as HTMLDivElement;
		descriptionDialog.innerHTML = description;
		descriptionDialog.className = 'cacaoDialog__description';
		dialog.appendChild(descriptionDialog);

		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'cacaoDialog__buttonList';

		const buttonPrimary = document.createElement('button');
		buttonPrimary.innerText = 'Confirm';
		buttonPrimary.className = 'buttonList__button button--primary';

		const buttonSecondary = document.createElement('button');
		buttonSecondary.innerText = 'Cancel';
		buttonSecondary.className = 'buttonList__button button--secondary';

		buttonContainer.appendChild(buttonSecondary);
		buttonContainer.appendChild(buttonPrimary);

		dialog.appendChild(buttonContainer);
		dialog.showModal();

		return new Promise<boolean>(resolve => {
			buttonPrimary.addEventListener('click', () => {
				dialog.close();
				dialog.remove();
				resolve(true);
			});

			buttonSecondary.addEventListener('click', () => {
				dialog.close();
				dialog.remove();
				resolve(false);
			});
		});
	}

	/**
	 * this method will pop up a dialog with a custom content, this dialog have just one button to leave: "Close"
	 * @param container
	 * @returns
	 */
	static showDialog(title: string, container: HTMLElement) {
		const dialog = document.createElement('dialog') as HTMLDialogElement;
		dialog.className = 'cacaoDialog';
		cacaoDialog._container.appendChild(dialog);

		const titleDialog = document.createElement('div') as HTMLDivElement;
		titleDialog.innerHTML = title;
		titleDialog.className = 'cacaoDialog__title ';
		dialog.appendChild(titleDialog);

		dialog.addEventListener('keydown', event => {
			if (event.code.toLowerCase() === 'escape') {
				event.preventDefault(); // Prevents the window from closing with the Escape key
			}
		});

		container.classList.add('cacaoDialog--scrollable');
		dialog.appendChild(container);

		const confirmButton = `
        <div class="cacaoDialog__buttonList">
            <button class="buttonList__button button--primary">Close</button>
        </div>
        `;

		dialog.innerHTML += confirmButton;
		cacaoDialog._container.classList.add('blurred');
		dialog.showModal();

		return new Promise<boolean>(resolve => {
			const btnYes = document.getElementsByClassName(
				'buttonList__button button--primary',
			)[0] as HTMLButtonElement;

			btnYes.addEventListener('click', () => {
				dialog.close();
				dialog.remove();
				cacaoDialog._container.classList.remove('blurred');
				resolve(true);
			});
		});
	}
}
