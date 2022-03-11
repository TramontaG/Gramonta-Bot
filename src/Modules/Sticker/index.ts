import { Module } from '../ModulesRegister';
import { Message, MessageTypes } from '@open-wa/wa-automate';
import fs from 'fs/promises';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';

class Sticker extends Module {
	logger: Logger;
	requester: Message | null;

	constructor() {
		super();
		this.requester = null;
		this.logger = new Logger();

		this.registerPublicMethod({
			name: 'default',
			method: this.sticker.bind(this),
		});

		this.registerPublicMethod({
			name: 'help',
			method: this.help.bind(this),
		});

		this.registerPublicMethod({
			name: 'img',
			method: this.stickerToImage.bind(this),
		});
	}

	async sticker() {
		try {
			const messageObject =
				this.requester?.quotedMsg || (this.zaplify?.messageObject as Message);

			const typesAllowed = [MessageTypes.IMAGE, MessageTypes.VIDEO];

			if (!typesAllowed.includes(messageObject.type))
				return this.sendError('Preciso de um video, gif ou imagem');

			const media = (await this.zaplify?.getMediaBufferFromMessage(
				messageObject
			)) as Buffer;

			if (messageObject.type === MessageTypes.IMAGE) {
				this.logSticker(messageObject, false);
				return await this.sendImageSticker(media);
			}
			if (messageObject.type === MessageTypes.VIDEO) {
				this.logSticker(messageObject, true);
				return await this.sendAnimatedSticker(media);
			}
		} catch (e) {
			this.sendError('Erro desconhecido: ' + e, this.requester || undefined);
		}
	}

	async stickerToImage() {
		try {
			const requester = this.zaplify?.messageObject as Message;
			if (requester.quotedMsg?.type !== MessageTypes.STICKER)
				return this.zaplify?.replyAuthor('Responda uma figurinha', requester);

			const stickerImage = await this.zaplify?.getSticker(requester.quotedMsgObj);
			if (!stickerImage)
				return this.zaplify?.replyAuthor('não consegui achar imagem nessa mensagem');

			return this.zaplify?.sendImageAsSticker(stickerImage, requester);
		} catch (e) {
			this.sendError('Erro desconhecido: ' + e, this.requester || undefined);
		}
	}

	async sendAnimatedSticker(media: Buffer) {
		try {
			return this.zaplify?.sendVideoSticker(
				media,
				'video/mp4',
				this.requester || undefined
			);
		} catch (e) {
			return this.sendError(e + JSON.stringify(e));
		}
	}

	async sendImageSticker(media: Buffer) {
		return this.zaplify?.sendSticker(media, this.requester || undefined);
	}

	async sendError(error: string | unknown, message?: Message) {
		return this.zaplify?.replyAuthor(`Erro: ${error}`, message);
	}

	async help() {
		const helpText = await fs.readFile('src/Modules/Sticker/Help.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText);
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
}

export default new Sticker();
