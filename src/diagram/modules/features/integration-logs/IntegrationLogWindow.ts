import type PlaybookHandler from '../../model/PlaybookHandler';
import type EventBus from 'diagram-js/lib/core/EventBus';
import type IntegrationLog from './IntegrationLog';
import { type LogItem, UserType } from './IntegrationLog';

export default class IntegrationLogsWindow {
	static $inject: string[];
	private _integrationLogs: IntegrationLog;

	constructor(playbookHandler: PlaybookHandler, eventBus: EventBus, container: HTMLElement) {
		this._integrationLogs = playbookHandler.getIntegrationLog();
		this._mockLogs();
		this._mockLogs();
		this._mockLogs();
		eventBus.on(['elements.changed', 'diagram.init', 'playbook.changed'], () => {
			this._createFullLogWindow();
			this._initMinimizedLogWindow(container);
		});
		this._createFullLogWindow();
		this._initMinimizedLogWindow(container);
	}

	// Creates a minimized log window, a small rectangle that shows the number of logs in the bottom right corner of the canvas. When clicked, it opens the full log window.
	_initMinimizedLogWindow(container: HTMLElement) {
		// Wrapper container for the minimized log window
		const wrapper = document.createElement('div');
		wrapper.classList.add('integration-logs_minimized');

		// Icon
		const icon = document.createElement('div');
		icon.classList.add('icon');

		// Message with the number of logs
		const message = document.createElement('div');
		message.className = 'message';
		message.innerHTML = `Integration Logs (${this._integrationLogs.logItems.length})`;

		// Adding the icon and message to the container
		wrapper.appendChild(icon);
		wrapper.appendChild(message);

		// Click handler to show the full log window
		wrapper.onclick = () => {
			const myForm = document.getElementById('myForm');
			if (myForm) {
				myForm.style.display = myForm.style.display === 'block' ? 'none' : 'block';
				icon.classList.toggle('switcher');
				myForm.scrollTop = myForm.scrollHeight;
			}
		};

		// Adding the wrapper to the canvas container
		container.appendChild(wrapper);
	}

	// Shows the full log window with all the logs in a dialog
	private _createFullLogWindow() {
		// Dialog element
		const dialog = document.createElement('div') as HTMLDivElement;
		dialog.className = 'integration-logs_expanded';
		dialog.id = 'myForm';

		/* ----- HEADER ----- */
		// Header in the dialog
		const header = document.createElement('div') as HTMLDivElement;
		header.classList.add('header');

		// Icon
		const icon = document.createElement('div');
		icon.classList.add('icon');

		// Header message with the number of logs
		const message = document.createElement('div');
		message.className = 'title';
		message.innerHTML = `Integration Logs (${this._integrationLogs.logItems.length})`;

		// Adding the icon and message to the container
		header.appendChild(icon);
		header.appendChild(message);

		dialog.appendChild(header);

		/* ----- BODY - LOGS ----- */
		const container = document.createElement('div');
		container.className = 'all-logs-container';
		for (const logItem of this._integrationLogs.logItems) {
			container.appendChild(this._createMessage(logItem));
		}

		dialog.appendChild(container);

		// Add the dialog to the body
		document.body.appendChild(dialog);

		return new Promise<boolean>(resolve => {
			header.addEventListener('click', () => {
				dialog.style.display = 'none';
				resolve(true);
			});
		});
	}

	/**
	 * Creates a log message element with the given log item data
	 * @param logItem   Log item data
	 * @returns         HTMLDivElement element with the log message
	 */
	private _createMessage(logItem: LogItem): HTMLDivElement {
		const isUser = logItem.userType === UserType.user;
		const logContainer = document.createElement('div');
		logContainer.classList.add('message-wrapper');
		if (!isUser) {
			logContainer.classList.add('system-log');
		}
		logContainer.innerHTML = `
        <div class="metadata">
          <p class="type"> ${logItem.userType}</p>
          ${isUser ? '<p class="timestamp-right">' : '<p class="timestamp-left">'} ${logItem.getLocalDate()} ${logItem.getLocalTime()}</p>
        </div>
        <div class="message-content">
          <h1 class="title">${logItem.messageTitle}</h1>
          <p class="text">${logItem.messageText}</p>
        </div>
    `;
		return logContainer;
	}

	// Mocks logs for testing purposes
	private _mockLogs() {
		this._integrationLogs.addUserLogItem('Ping', 'Sending a ping to the SOARCA server');
		this._integrationLogs.addSystemLogItem('Pong', '200 OK');
		this._integrationLogs.addUserLogItem(
			'Trigger Playbook',
			'THe playbook id is 12fasd123d1233',
		);
		this._integrationLogs.addSystemLogItem('Execution ID', 'Execution ID: 12341234123');
		this._integrationLogs.addUserLogItem(
			'Checing Execution Status',
			'Checking triggered playbook with execution id 12341234123',
		);
		this._integrationLogs.addSystemLogItem(
			'Execution Status Update',
			'Execution status recieved',
		);
		this._integrationLogs.addUserLogItem(
			'Checing Execution Status',
			'Checking triggered playbook with execution id 12341234123 lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum',
		);
		this._integrationLogs.addSystemLogItem(
			'Execution Status Update',
			'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum',
		);
	}
}

IntegrationLogsWindow.$inject = ['playbookHandler', 'eventBus', 'config.canvas.container'];
