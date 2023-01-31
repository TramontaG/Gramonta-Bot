import { Message, MessageTypes } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';

class Reveal extends Module {
	constructor() {
		super();

		this.makePublic('default', this.default);
		this.makePublic('help', this.help);

		this.messagesPath = './src/Modules/Reveal/messages.zap.md';
	}

	async default(_: Args, requester: Message) {
		try {
			const quotedMessage = requester.quotedMsg;
			if (!quotedMessage) {
				return this.sendMessageFromTemplate('AskQuote', requester);
			}

			if (!quotedMessage.isViewOnce) {
				return this.sendMessageFromTemplate('AskViewOnce', requester);
			}

			const mediaBuffer = await this.zaplify.getMediaBufferFromMessage(
				quotedMessage
			);

			const mimetype =
				quotedMessage.type === MessageTypes.IMAGE ? 'image' : 'video/mp4';

			return this.zaplify.sendFileFromBuffer(
				mediaBuffer,
				mimetype,
				quotedMessage.caption,
				requester
			);
		} catch (e) {
			return this.sendMessageFromTemplate('Error', requester, {
				error: e,
			});
		}
	}

	async help(_: Args, requester: Message) {
		return this.sendMessageFromTemplate('Help', requester);
	}
}

export default Reveal;
