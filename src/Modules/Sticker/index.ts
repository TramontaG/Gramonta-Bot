import { Args, Module } from '../ModulesRegister';
import { Message, MessageTypes } from '@open-wa/wa-automate';
import fs from 'fs/promises';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';
import Zaplify from '../Zaplify';

class Sticker extends Module {
	logger: Logger;

	constructor() {
		super();
		this.logger = new Logger();

		this.makePublic('default', this.sticker);
		this.makePublic('toimg', this.stickerToImage);
		this.makePublic('tovideo', this.stickerToVideo);
		this.makePublic('help', this.help);
	}

	async sticker(_: Args, requester: Message) {
		try {
			const stickeredMessage = requester.quotedMsg || requester;

			const typesAllowed = [MessageTypes.IMAGE, MessageTypes.VIDEO];

			if (!typesAllowed.includes(stickeredMessage.type))
				return this.sendError('Preciso de um video, gif ou imagem', requester);

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
			this.sendError(
				'Erro desconhecido: ' + e,
				(this.requester as Message) || undefined
			);
		}
	}

	async sendAnimatedSticker(media: Buffer, requester: Message) {
		try {
			return this.zaplify?.sendVideoSticker(media, 'video/mp4', requester);
		} catch (e) {
			return this.sendError(e + JSON.stringify(e), requester);
		}
	}

	async sendImageSticker(media: Buffer, requester: Message) {
		return this.zaplify?.sendSticker(media, requester);
	}

	async sendError(error: string | unknown, requester: Message) {
		return this.zaplify?.replyAuthor(`Erro: ${error}`, requester);
	}

	async help(_: Args, requester: Message) {
		const helpText = await fs.readFile('src/Modules/Sticker/Help.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText, requester);
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

	stickerToImage(args: Args, requester: Message) {
		const quotedMessage = requester.quotedMsg;
		if (!quotedMessage)
			return this.zaplify?.replyAuthor(
				'Por favor, responda alguma figurinha com esse comando para eu enviar a mensagem',
				requester
			);
		return this.zaplify?.sendImageFromSticker(requester, quotedMessage);
	}

	stickerToVideo(rgs: Args, requester: Message) {
		const quotedMessage = requester.quotedMsg;
		if (!quotedMessage)
			return this.zaplify?.replyAuthor(
				'Por favor, responda alguma figurinha com esse comando para eu enviar a mensagem',
				requester
			);
		return this.zaplify?.sendVideoFromSticker(requester, quotedMessage);
	}
}

export default Sticker;
