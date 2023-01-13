import { Args, Module } from '../ModulesRegister';
import { Message, MessageTypes } from '@open-wa/wa-automate';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';

class Sticker extends Module {
	logger: Logger;

	constructor() {
		super();
		this.logger = new Logger();

		this.messagesPath = './src/Modules/Sticker/messages.zap.md';

		this.makePublic('default', this.sticker);
		this.makePublic('toimg', this.stickerToImage);
		this.makePublic('help', this.help);
	}

	async sticker(_: Args, requester: Message) {
		try {
			const stickeredMessage = requester.quotedMsg || requester;

			const typesAllowed = [MessageTypes.IMAGE, MessageTypes.VIDEO];

			if (!typesAllowed.includes(stickeredMessage.type))
				return await this.getMessage('invalidData').then(msg =>
					this.sendMessage(msg, requester)
				);

			const media = (await this.zaplify?.getMediaBufferFromMessage(
				stickeredMessage
			)) as Buffer;

			if (stickeredMessage.type === MessageTypes.IMAGE) {
				this.logSticker(requester, false);
				return await this.sendImageSticker(media, requester);
			}
			if (stickeredMessage.type === MessageTypes.VIDEO) {
				this.logSticker(requester, true);
				return await this.sendAnimatedSticker(media, requester);
			}
		} catch (e) {
			this.getMessage('error', { errorMessage: e }).then(msg =>
				this.sendMessage(msg, requester)
			);
		}
	}

	async sendAnimatedSticker(media: Buffer, requester: Message) {
		try {
			return this.zaplify?.sendVideoSticker(media, 'video/mp4', requester);
		} catch (e) {
			return this.getMessage('error').then(msg => this.sendMessage(msg, requester));
		}
	}

	async sendImageSticker(media: Buffer, requester: Message) {
		return this.zaplify?.sendSticker(media, requester);
	}

	async sendMessage(message: string, requester: Message) {
		return this.zaplify?.replyAuthor(message, requester);
	}

	async help(_: Args, requester: Message) {
		this.getMessage('help').then(msg => this.zaplify.sendMessage(msg, requester));
	}

	logSticker(messageObject: Message, animated: boolean) {
		this.logger.insertNew(EntityTypes.STICKERS, {
			animated,
			groupName: messageObject.isGroupMsg ? messageObject.chat.name : '_',
			chatId: messageObject.chat.id,
			requester: messageObject.sender.formattedName,
			date: new Date().getTime(),
		});
	}

	stickerToImage(_: Args, requester: Message) {
		const quotedMessage = requester.quotedMsg;
		if (!quotedMessage)
			return this.getMessage('no-sticker').then(msg =>
				this.zaplify.sendMessage(msg, requester)
			);
		return this.zaplify?.sendImageFromSticker(requester, quotedMessage);
	}
}

export default Sticker;
