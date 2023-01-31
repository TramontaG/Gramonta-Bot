import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import { Message } from '@open-wa/wa-automate';

class Help extends Module {
	constructor() {
		super();
		this.makePublic('default', this.sendHelp);
		this.messagesPath = './src/Modules/Help/messages.zap.md';
	}

	async sendHelp(_: Args, requester: Message) {
		return this.sendMessageFromTemplate('Help', requester);
	}
}

export default Help;
