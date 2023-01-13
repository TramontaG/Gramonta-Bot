import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';

class Reset extends Module {
	constructor() {
		super();
		this.makePublic('default', this.reset);
	}

	reset(_: Args, requester: Message) {
		if (!requester.id.includes('5511947952409')) {
			return;
		}

		return new Promise((resolve, reject) => {
			reject('Owner requested reset');
		});
	}
}

export default Reset;
