import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import { getMessage } from 'src/Helpers/messageGetter';

class PatchNotes extends Module {
	constructor() {
		super();
		this.makePublic('default', this.sendPatchNotes);
	}

	async sendPatchNotes(_: Args, requester: Message) {
		try {
			const patches = await fs.readFile('./PatchNotes.md', { encoding: 'utf-8' });
			const message = getMessage('latest', patches, {
				myNumber: 3,
			});
			this.zaplify?.replyAuthor(message, requester);
		} catch (e) {
			this.zaplify?.replyAuthor(`Erro: ${e}`, requester);
		}
	}
}

export default PatchNotes;
