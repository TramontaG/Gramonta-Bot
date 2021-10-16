import { Client, decryptMedia, Message, useragent } from '@open-wa/wa-automate';
import fs from 'fs/promises';

type Mimetype = 'video/mp4' | 'image/gif' | 'image';

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

	replyAuthor(message: string, author?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
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
			title || ''
		);
	}

	async sendFile(fileAddress: string, caption: string, quotedMessage?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		console.log(fileAddress);
		const fileHasBeenSent = await this.client.sendFile(
			quotedMessage?.from || this.messageObject.from,
			fileAddress,
			'',
			caption || '',
			quotedMessage?.id || this.messageObject.id
		);
		return fileHasBeenSent;
	}

	async getMediaBuffer(mediaAddress: string) {
		const media = await fs.readFile(mediaAddress, {
			encoding: 'base64',
		});
		return Buffer.from(media, 'base64');
	}

	async getMediaBufferFromMessage(quotedMessage?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		const message = quotedMessage || this.messageObject;
		if (message && !message.isMedia) throw 'No media sent on message';
		const mediaData = await decryptMedia(
			quotedMessage || this.messageObject,
			this.userAgentOverride
		);
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
				author: 'Tramonta Bot',
				pack: 'Pack do bot',
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
				endTime: '00:00:10.0',
			},
			{
				author: 'Bot do tramonta',
				pack: 'Pack do bot',
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

	sendImageAsSticker(imageBuffer: Buffer, requester?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		this.client.sendMp4AsSticker(
			requester?.from || this.messageObject?.from,
			imageBuffer
		);
	}

	sendImageFromUrl(url: string, caption?: string, requester?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		this.client.sendImage(
			requester?.from || this.messageObject.from,
			url,
			'Youtube Thumbnail',
			caption || ''
		);
	}
}

export default Zaplify;
