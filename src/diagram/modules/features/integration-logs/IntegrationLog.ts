enum UserType {
	User = 'user',
	System = 'system',
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

	printLogItem() {
		return `Timestamp: ${this.timestamp.toLocaleDateString()} ${this.timestamp.toLocaleTimeString()}, Message: ${this.messageTitle}, UserType: ${this.userType}`;
	}
}

export default class IntegrationLog {
	private _logItems: LogItem[];

	constructor() {
		this._logItems = [];
	}

	get logItems() {
		return this._logItems;
	}

	addLogItem(messageTitle: string, messageText: string, userType: UserType) {
		const logItem = new LogItem(userType, messageTitle, messageText);
		this._logItems.push(logItem);
	}

	showAllLogItems() {
		return this._logItems.map(logItem => {
			logItem.printLogItem();
		});
	}
}
