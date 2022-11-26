import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';

class PatchNotes extends Module {
	constructor() {
		super();
	}

	sendPatchNotes(args: Args, requester: Message) {
		try {
		} catch (e) {
			this.zaplify?.replyAuthor(`Erro: ${e}`, requester);
		}
	}
}
