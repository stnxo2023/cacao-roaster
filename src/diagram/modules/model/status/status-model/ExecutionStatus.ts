import type { Identifier } from 'lib/cacao2-js/src/data-types/Identifier';
import type { Timestamp } from 'lib/cacao2-js/src/data-types/Timestamp';

export interface ExecutionStatusProps {
	type: string;
	execution_id: Identifier;
	playbook_id: Identifier;
	started: Timestamp;
	ended: Timestamp;
	status:
		| 'successfully_executed'
		| 'failed'
		| 'ongoing'
		| 'server_side_error'
		| 'client_side_error'
		| 'timeout_error'
		| 'exception_condition_invoked';
	status_text: string;
	step_results: Record<Identifier, StatusElement>;
	request_interval: number;
}

export interface ExecutionStatus extends ExecutionStatusProps {}
export class ExecutionStatus {
	constructor(partialprops: Partial<ExecutionStatusProps> = {}) {
		const props: ExecutionStatusProps = partialprops as ExecutionStatusProps;
		this.type = 'execution_status';
		this.execution_id = props.execution_id;
		this.playbook_id = props.playbook_id;
		this.started = props.started;
		this.ended = props.ended;
		this.status = props.status;
		this.status_text = props.status_text;
		this.step_results = {};
		for (const key in props.step_results) {
			// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
			if (props.step_results.hasOwnProperty(key)) {
				this.step_results[key] = new StatusElement(props.step_results[key]);
			}
		}
		this.request_interval = props.request_interval;
	}
}

export interface StatusElementProps {
	type: 'execution-status';
	execution_id: Identifier;
	step_id: Identifier;
	started: Timestamp;
	ended: Timestamp;
	duration: number;
	status:
		| 'successfully_executed'
		| 'failed'
		| 'ongoing'
		| 'await_user_input'
		| 'server_side_error'
		| 'client_side_error'
		| 'timeout_error'
		| 'exception_condition_invoked';
	status_text: string;
	executed_by: Identifier;
	commands_b64: string[];
	notes: string;
	variables: Record<string, string>;
	automated_execution: boolean;
}

export interface StatusElement extends StatusElementProps {}
export class StatusElement {
	constructor(partialprops: Partial<StatusElementProps> = {}) {
		const props: StatusElementProps = partialprops as StatusElementProps;
		this.type = 'execution-status';
		this.execution_id = props.execution_id;
		this.step_id = props.step_id;
		this.started = props.started;
		this.ended = props.ended;
		this.status = props.status;
		this.status_text = props.status_text;
		this.executed_by = props.executed_by;
		if (props.commands_b64) {
			this.commands_b64 = [...props.commands_b64];
		}
		this.notes = props.notes;
		this.variables = props.variables;
		this.automated_execution = props.automated_execution;
	}
}
