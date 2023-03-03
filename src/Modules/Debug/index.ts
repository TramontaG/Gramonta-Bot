import { Message } from '@open-wa/wa-automate';
import {
	decodePayloadFromMessage,
	EmojiPayload,
	hidePayload,
} from 'src/lib/T-Parser/HiddenPayload';
import { Args, DefaultEmoji, Module } from '../ModulesRegister';

class Debug extends Module {
	constructor() {
		super();

		this.makePublic('default', this.default);
		this.onReact(DefaultEmoji.love, this.onLove);
	}

	onLove(requester: Message, payload: Args) {
		console.log('HANDLER');
		console.log(payload);
	}

	default(_: Args, requester: Message) {
		this.zaplify.replyAuthor(
			`Me ajude a testar uma nova funcinalidade: Reaja a essa mensagem com um ${
				DefaultEmoji.love
			} ${hidePayload(
				JSON.stringify({
					[DefaultEmoji.love]: '!debug test this is my message',
				})
			)}`,
			requester
		);
	}
}

export default Debug;
