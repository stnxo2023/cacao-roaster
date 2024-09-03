import type PlaybookHandler from '../../model/PlaybookHandler';
import type EventBus from 'diagram-js/lib/core/EventBus';
import CacaoDialog from '../../core/CacaoDialog';
import type IntegrationLog from './IntegrationLog';
import { LogItem } from './IntegrationLog';

// [path,fileName,errorMessage]
type PlaybookError = [string, string, string];

export default class IntegrationLogsWindow {
	private _playbookHandler: PlaybookHandler;
	private _integrationLogsWindowContainer!: HTMLElement;
	private _integrationLogsWindowIcon!: HTMLElement;
	private _integrationLogsWindowMessage!: HTMLElement;
	static $inject: string[];

	constructor(playbookHandler: PlaybookHandler, eventBus: EventBus, container: HTMLElement) {
		this._playbookHandler = playbookHandler;
		this.initContainer(container);
		this._logs(this._playbookHandler.getIntegrationLog());
	}

	initContainer(container: HTMLElement) {
		this._integrationLogsWindowContainer = document.createElement('div');
		this._integrationLogsWindowContainer.className = 'integration_logs_window-container';

		this._integrationLogsWindowIcon = document.createElement('div');
		this._integrationLogsWindowIcon.className = 'integration_logs_window-icon';

		this._integrationLogsWindowMessage = document.createElement('div');
		this._integrationLogsWindowMessage.className = 'integration_logs_window-message';

		container.appendChild(this._integrationLogsWindowContainer);
		this._integrationLogsWindowContainer.appendChild(this._integrationLogsWindowIcon);
		this._integrationLogsWindowContainer.appendChild(this._integrationLogsWindowMessage);
	}

	private _logs(Logs: IntegrationLog) {
		this._integrationLogsWindowContainer.classList.remove('integration_logs_window-correct');
		this._integrationLogsWindowIcon.classList.remove('integration_logs_window-icon-correct');

		this._integrationLogsWindowContainer.classList.add('integration_logs_window-error');
		this._integrationLogsWindowIcon.classList.add('integration_logs_window-icon-error');

		this._integrationLogsWindowMessage.innerHTML = `Invalid Playbook (${Logs.logItems.length})`;
		this._integrationLogsWindowContainer.onclick = () => {
			this.showLogs(Logs);
		};
	}

	private showLogs(logs: IntegrationLog) {
		const modalContainer = document.createElement('div');

		for (const log of logs.logItems) {
			const logContainer = document.createElement('div');
			logContainer.className = 'integration_logs_window-dialog-log-container';
			logContainer.innerHTML = `
                <h1 class="integration_logs_window-dialog-log-title">${log.messageTitle}</h1>
                <p class="integration_logs_window-dialog-log-path">in ${log.userType}</p>
                <p class="integration_logs_window-dialog-log-path">in ${log.timestamp}</p>
                <p class="integration_logs_window-dialog-log-message">${log.messageText}</p>
            `;
			modalContainer.appendChild(logContainer);
		}
		CacaoDialog.showDialog('Playbook Errors', modalContainer);
	}
}

IntegrationLogsWindow.$inject = ['playbookHandler', 'eventBus', 'config.canvas.container'];
