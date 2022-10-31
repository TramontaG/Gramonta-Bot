import { Args, Module } from '../ModulesRegister';
import { Message, MessageTypes } from '@open-wa/wa-automate';
import fs from 'fs/promises';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';

class Sticker extends Module {
	logger: Logger;

	constructor() {
		super();
		this.logger = new Logger();

		this.registerPublicMethod({
			name: 'default',
			method: this.sticker.bind(this),
		});

		this.makePublic('help', this.help);
	}

	async sticker(_: Args, requester: Message) {
		try {
			requester = requester.quotedMsg || requester;

			const typesAllowed = [MessageTypes.IMAGE, MessageTypes.VIDEO];

			if (!typesAllowed.includes(requester.type))
				return this.sendError('Preciso de um video, gif ou imagem');

			const media = (await this.zaplify?.getMediaBufferFromMessage(
				requester
			)) as Buffer;

			if (requester.type === MessageTypes.IMAGE) {
				this.logSticker(requester, false);
				return await this.sendImageSticker(media);
			}
			if (requester.type === MessageTypes.VIDEO) {
				this.logSticker(requester, true);
				return await this.sendAnimatedSticker(media);
			}
		} catch (e) {
			this.sendError(
				'Erro desconhecido: ' + e,
				(this.requester as Message) || undefined
			);
		}
	}

	async sendAnimatedSticker(media: Buffer) {
		try {
			return this.zaplify?.sendVideoSticker(
				media,
				'video/mp4',
				(this.requester as Message) || undefined
			);
		} catch (e) {
			return this.sendError(e + JSON.stringify(e));
		}
	}

	async sendImageSticker(media: Buffer) {
		return this.zaplify?.sendSticker(
			media,
			(this.requester as Message) || undefined
		);
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

export default Sticker;
