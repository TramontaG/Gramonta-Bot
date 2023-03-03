import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import { getMessage } from 'src/Helpers/messageGetter';

class PatchNotes extends Module {
	constructor() {
		super();
		this.makePublic('default', this.sendPatchNotes);
		this.messagesPath = './PatchNotes.md';
	}

	async sendPatchNotes(_: Args, requester: Message) {
		try {
			return this.sendMessageFromTemplate('latest', requester);
		} catch (e) {
			this.zaplify.replyAuthor(`Erro: ${e}`, requester);
		}
	}
}

export default PatchNotes;
