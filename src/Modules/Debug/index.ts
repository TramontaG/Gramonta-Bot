import { Message } from '@open-wa/wa-automate';
import {
	decodePayloadFromMessage,
	hidePayload,
} from 'src/lib/T-Parser/HiddenPayload';
import { Args, Module } from '../ModulesRegister';

class Debug extends Module {
	constructor() {
		super();

		this.makePublic('default', this.default);
		this.makePublic('retrieve', this.retrieve);
	}

	default(_: Args, requester: Message) {
		this.zaplify.replyAuthor(
			`Apenas uma mensagem testeeee ${hidePayload(
				'Testando essa joçaaa uhuu {asasas || }'
			)}`,
			requester
		);
	}

	retrieve(_: Args, requester: Message) {
		try {
			const quoted = requester.quotedMsg!;
			const payload = decodePayloadFromMessage(quoted.body);
			this.zaplify.replyAuthor(payload, requester);
		} catch (e) {
			console.warn(e);
		}
	}
}

export default Debug;
