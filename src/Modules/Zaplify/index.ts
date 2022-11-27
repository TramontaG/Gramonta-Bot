import {
	Client,
	decryptMedia,
	Message,
	MessageTypes,
	useragent,
} from '@open-wa/wa-automate';
import fs from 'fs/promises';
import MockedClient from 'src/Debug/ZaplifyMock';
import { getFormattedDate } from 'src/Helpers/Date';

type Mimetype = 'video/mp4' | 'image/gif' | 'image' | 'video' | 'video/mpeg';

type Button = {
	id: string;
	text: string;
};

class Zaplify {
	client: Client;
	messageObject: Message | null;
	userAgentOverride: string;

	constructor(client: Client) {
		this.client = client;
		this.messageObject = null;
		this.userAgentOverride = useragent;
	}

	getClient() {
		return this.client;
	}

	getQuotedMesage() {
		return this.messageObject?.quotedMsg;
	}

	setMessageObject(message: Message) {
		this.messageObject = message;
	}

	replyAuthor(message: string, author: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		const isMe = !!author && author.fromMe;

		if (isMe) {
			console.log('ITS A ME!!');
			return this.client.sendText(author.from, message);
		}

		return this.client.reply(
			author?.from || this.messageObject.from,
			message,
			author?.id || this.messageObject.id
		);
	}

	sendMessage(message: string, requester?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		return this.client.sendText(requester?.from || this.messageObject.from, message);
	}

	sendButtons(
		caption: string,
		buttons: Button[],
		requester?: Message,
		title?: string
	) {
		if (!this.messageObject) throw 'No message object initialized';
		return this.client.sendButtons(
			requester?.from || this.messageObject.from,
			caption,
			buttons,
			title || '',
			''
		);
	}

	async sendFile(fileAddress: string, caption: string, quotedMessage?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		const fileHasBeenSent = await this.client.sendFile(
			quotedMessage?.from || this.messageObject.from,
			fileAddress,
			'',
			caption || '',
			quotedMessage?.id || this.messageObject.id
		);
		return fileHasBeenSent;
	}

	async sendSong(fileAddress: string, caption: string, quotedMessage?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		const fileHasBeenSent = await this.client.sendAudio(
			quotedMessage?.from || this.messageObject.from,
			fileAddress
		);
		return fileHasBeenSent;
	}

	async getMediaBuffer(mediaAddress: string) {
		const media = await fs.readFile(mediaAddress, {
			encoding: 'base64',
		});
		return Buffer.from(media, 'base64');
	}

	async getMediaBufferFromMessage(quotedMessage: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		const message = quotedMessage || this.messageObject;
		if (message && !message.isMedia && !(message.type === MessageTypes.VOICE))
			throw 'No media sent on message';
		const mediaData = await decryptMedia(quotedMessage, this.userAgentOverride);
		return mediaData;
	}

	getBase64fromBuffer(buffer: Buffer, mimetype: Mimetype) {
		const media = `data:${mimetype};base64,${buffer.toString('base64')}`;
		return media;
	}

	async sendSticker(
		imgBufferOrAddress: string | Buffer,
		requester?: Message
	): Promise<string | boolean> {
		if (!this.messageObject) throw 'No message object initialized';
		let imgBuffer;
		if (typeof imgBufferOrAddress === 'string') {
			imgBuffer = await this.getMediaBuffer(imgBufferOrAddress);
		} else {
			imgBuffer = imgBufferOrAddress;
		}
		return this.client.sendImageAsSticker(
			requester?.from || this.messageObject.from,
			imgBuffer,
			{
				author: 'Gramonta-bot \n+5511947952409',
				pack: `Criado em ${getFormattedDate()} \npor ${requester?.notifyName}`,
				keepScale: true,
			}
		);
	}

	sendVideoSticker(videoBuffer: Buffer, mimetype: Mimetype, requester?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		const videoBase64 = this.getBase64fromBuffer(videoBuffer, mimetype);
		return this.client.sendMp4AsSticker(
			requester?.from || this.messageObject.from,
			videoBase64,
			{
				fps: 30,
				square: 256,
				endTime: '00:00:15.0',
			},
			{
				author: 'Gramonta-bot -+5511947952409',
				pack: `Criado em ${getFormattedDate()} por ${requester?.notifyName}`,
				keepScale: true,
			}
		);
	}

	async getSticker(quotedMessage?: Message) {
		const message = quotedMessage || this.messageObject;
		if (!message) throw 'No message object initialized';
		const sticker = await this.client.getStickerDecryptable(message.id);
		console.log(sticker, message.id);
		return decryptMedia(sticker);
	}

	sendFileFromUrl(
		url: string,
		fileName: string,
		requester: Message,
		caption: string = ''
	) {
		const message = requester || this.messageObject;
		if (!message) throw 'No message object initialized';
		return this.client.sendFileFromUrl(
			requester.from,
			url,
			caption,
			fileName,
			requester.id
		);
	}

	sendImageAsSticker(imageBuffer: Buffer, requester?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		this.client.sendImageAsSticker(
			requester?.from || this.messageObject?.from,
			imageBuffer
		);
	}

	sendImageFromUrl(url: string, caption: string, requester: Message) {
		try {
			this.client.sendImage(requester.to, url, 'Gramonta-Bot Image', caption);
			return;
		} catch (e) {
			this.replyAuthor('erro desconhecido', requester);
		}
	}

	sendFileFromBuffer(
		buffer: Buffer,
		mimeType: Mimetype,
		caption: string = '',
		requester: Message
	) {
		try {
			const base64 = this.getBase64fromBuffer(buffer, mimeType);
			return this.client.sendFile(requester.from, base64, 'file', caption);
		} catch (e) {
			this.replyAuthor(JSON.stringify(e), requester);
		}
	}

	sendFileFromPath(path: string, caption: string = '', requester: Message) {
		try {
			return this.client.sendFile(
				requester.from,
				path,
				'file.mp4',
				caption,
				undefined,
				undefined,
				undefined,
				false
			);
		} catch (e) {
			this.replyAuthor(JSON.stringify(e), requester);
		}
	}

	sendVideo(buffer: Buffer, requester: Message, mimeType: Mimetype = 'video/mp4') {
		const base64 = this.getBase64fromBuffer(buffer, mimeType);

		return this.client.sendFile(requester.from, base64, 'file', '');
	}

	async isAdmin(requester: Message) {
		if (!requester.isGroupMsg) return true;
		const allAdmins = await this.client.getGroupAdmins(
			requester.chat.groupMetadata.id
		);
		return allAdmins.includes(requester.sender.id);
	}

	async sendImageFromSticker(requester: Message, stickerMsg: Message) {
		try {
			const stickerBuffer = await decryptMedia(stickerMsg);
			return this.client.sendFile(
				requester.to,
				this.getBase64fromBuffer(stickerBuffer, 'image'),
				'Gramonta-bot',
				'',
				requester.id
			);
		} catch (e) {
			console.warn(e);
		}
	}

	async sendVideoFromSticker(requester: Message, stickerMsg: Message) {
		try {
			const stickerBuffer = await decryptMedia(stickerMsg);
			return this.client.sendVideoAsGif(
				requester.to,
				this.getBase64fromBuffer(stickerBuffer, 'video/mpeg'),
				'sticker.mp4',
				'',
				requester.id
			);
		} catch (e) {
			console.warn(e);
		}
	}

	async react(emoji: string, requester: Message) {
		return this.client.react(requester.id, emoji);
	}
}

export default Zaplify;
