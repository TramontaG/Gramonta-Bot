import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import { Message } from '@open-wa/wa-automate';

class Help extends Module {
	constructor() {
		super();
		this.makePublic('default', this.sendHelp);
	}

	async sendHelp(_: Args, requester: Message) {
		const helpText = await fs.readFile('src/Modules/About/about.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText, requester);
	}
}

export default Help;
