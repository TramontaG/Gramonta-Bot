import { Module } from '../ModulesRegister';
import fs from 'fs/promises';
import { Message } from '@open-wa/wa-automate';

class Help extends Module {
	constructor() {
		super();
		this.registerPublicMethod({
			name: 'default',
			method: this.sendHelp.bind(this),
		});
	}

	async sendHelp() {
		const helpText = await fs.readFile('src/Modules/Help/Help.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText, this.requester as Message);
	}
}

export default Help;
