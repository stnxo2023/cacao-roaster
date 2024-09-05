import type EventBus from 'diagram-js/lib/core/EventBus';

export enum UserType {
	user = 'User',
	system = 'System',
}

export class LogItem {
	private _timestamp: Date;
	private _messageTitle: string;
	private _messageText: string;
	private _userType: UserType;

	constructor(userType: UserType, messageTitle: string, messageText: string) {
		this._timestamp = new Date(Date.now());
		this._messageTitle = messageTitle;
		this._messageText = messageText;
		this._userType = userType;
	}

	get timestamp(): Date {
		return this._timestamp;
	}
	get messageTitle(): string {
		return this._messageTitle;
	}
	get messageText(): string {
		return this._messageText;
	}
	get userType(): UserType {
		return this._userType;
	}

	getLocalTime(): string {
		return `${this.timestamp.toLocaleTimeString()}.${this.timestamp.getMilliseconds()}`;
	}

	getLocalDate(): string {
		return this.timestamp.toLocaleDateString();
	}
}

export default class IntegrationLog {
	private _logItems: LogItem[];
	private _eventBus: EventBus;
	static $inject: string[];

	constructor(eventBus: EventBus) {
		this._logItems = [];
		this._eventBus = eventBus;
	}

	get logItems() {
		return this._logItems;
	}

	private _addLogItem(messageTitle: string, messageText: string, userType: UserType) {
		const logItem = new LogItem(userType, messageTitle, messageText);
		this._logItems.push(logItem);
		this._eventBus.fire('integrationLog.changed');
	}

	addUserLogItem(messageTitle: string, messageText: string) {
		this._addLogItem(messageTitle, messageText, UserType.user);
	}

	addSystemLogItem(messageTitle: string, messageText: string) {
		this._addLogItem(messageTitle, messageText, UserType.system);
	}

	clearLog() {
		this._logItems = [];
		this._eventBus.fire('integrationLog.changed');
	}
}
IntegrationLog.$inject = ['eventBus'];
