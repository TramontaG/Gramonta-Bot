import { Module } from '../ModulesRegister';
import { Message, MessageTypes } from '@open-wa/wa-automate';
import fs from 'fs/promises';

class Sticker extends Module {
	requester: Message | null;

	constructor() {
		super();
		this.requester = null;

		this.registerPublicMethod({
			name: 'default',
			method: this.sticker.bind(this),
		});

		this.registerPublicMethod({
			name: 'help',
			method: this.help.bind(this),
		});
	}

	async sticker() {
		try {
			const messageObject = this.requester?.quotedMsg || this.requester;
			if (!messageObject) {
				this.sendError('Mano, algo deu muuuito errado');
				return;
			}
			console.log(messageObject.id);

			const typesAllowed = [MessageTypes.IMAGE, MessageTypes.VIDEO];

			if (typesAllowed.indexOf(messageObject.type) == -1) {
				this.zaplify?.replyAuthor(
					'Preciso de uma imagem ou video. Digite !sticker help para entender como funciono :)'
				);
				return;
			}

			const media = (await this.zaplify?.getMediaBufferFromMessage(
				messageObject
			)) as Buffer;

			if (messageObject.duration && messageObject.duration > 6) {
				this.sendError('Só consigo fazer figurinhas de no máximo 5 segundos');
				return;
			}

			if (messageObject.type === MessageTypes.IMAGE) {
				return await this.sendImageSticker(media);
			}
			if (messageObject.type === MessageTypes.VIDEO) {
				return await this.sendAnimatedSticker(media);
			}
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
			return this.sendError(e);
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
}

export default new Sticker();
