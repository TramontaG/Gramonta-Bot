import {
	Client,
	ContactId,
	decryptMedia,
	Message,
	MessageId,
	MessageTypes,
	useragent,
} from '@open-wa/wa-automate';
import { AdvancedButton } from '@open-wa/wa-automate/dist/api/model/button';
import fs from 'fs/promises';
import { sliceButtons } from 'src/Helpers/Buttons';
import { getFormattedDate } from 'src/Helpers/Date';
import ffmpeg from 'fluent-ffmpeg';
import { hidePayload } from 'src/lib/T-Parser/HiddenPayload';

export type Mimetype =
	| 'video/mp4'
	| 'image/gif'
	| 'image'
	| 'video'
	| 'video/mpeg'
	| 'audio/webm';

type Button = {
	id: string;
	text: string;
};

export const signature = hidePayload('Gramonta-Bot');

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

		return this.client.sendReplyWithMentions(
			author.chatId,
			signature + message,
			author?.id || this.messageObject.id
		);
	}

	sendMessage(message: string, requester?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		return this.client.sendText(
			requester?.chatId || this.messageObject.chatId,
			signature + message
		);
	}

	async sendButtons(
		caption: string,
		buttons: Button[],
		requester: Message,
		title?: string,
		footer?: string
	) {
		if (!this.messageObject) throw 'No message object initialized';
		const buttonsInChunks = sliceButtons(buttons);

		if (title) await this.replyAuthor(title, requester);

		if (buttonsInChunks.length > 1) await this.replyAuthor(caption, requester);

		let index = 1;
		for await (const btn of buttonsInChunks) {
			await this.client.sendButtons(
				requester.chatId,
				signature +
					(buttonsInChunks.length > 1
						? `${index} de ${buttonsInChunks.length}`
						: caption),
				btn
			);
			index++;
		}

		if (footer) await this.replyAuthor(footer, requester);
	}

	sendAdvancedButtons(
		caption: string,
		buttons: AdvancedButton[],
		requester: Message,
		title: string,
		footer: string
	) {
		if (!this.messageObject) throw 'No message object initialized';
		const buttonsInChunks = sliceButtons(buttons);
		buttonsInChunks.forEach(btn => {
			// @ts-ignore
			this.client.sendAdvancedButtons(
				requester.chatId,
				signature + caption,
				btn,
				title,
				footer
			);
		});
	}

	async sendFile(fileAddress: string, caption: string, quotedMessage: Message) {
		const fileHasBeenSent = await this.client.sendFile(
			quotedMessage.chatId,
			fileAddress,
			'',
			signature + caption || '',
			quotedMessage.id
		);
		return fileHasBeenSent;
	}

	async sendSong(fileAddress: string, requester: Message) {
		const outFile = './media/ytDownload/song.mp3';

		return new Promise((resolve, reject) => {
			ffmpeg(fileAddress)
				.output(outFile)
				.saveToFile(outFile)

				.on('end', () => {
					resolve(this.client.sendAudio(requester.chatId, outFile, requester.id));
				})

				.on('error', err => {
					reject(err);
				});
		});
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
		return this.client.sendImageAsStickerAsReply(
			requester?.chatId || this.messageObject.chatId,
			imgBuffer,
			requester?.id || this.messageObject.id,
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
			requester?.chatId || this.messageObject.chatId,
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
			},
			requester?.id
		);
	}

	async getSticker(quotedMessage?: Message) {
		const message = quotedMessage || this.messageObject;
		if (!message) throw 'No message object initialized';
		const sticker = await this.client.getStickerDecryptable(message.id);
		return decryptMedia(sticker);
	}

	sendFileFromUrl(
		url: string,
		fileName: string,
		requester: Message,
		caption: string = ''
	) {
		return this.client.sendFileFromUrl(
			requester.chatId,
			url,
			fileName,
			signature + caption,
			requester.id
		);
	}

	sendImageAsSticker(imageBuffer: Buffer, requester?: Message) {
		if (!this.messageObject) throw 'No message object initialized';
		this.client.sendImageAsSticker(
			requester?.chatId || this.messageObject.from,
			imageBuffer
		);
	}

	async sendImageFromUrl(url: string, caption: string, requester: Message) {
		try {
			this.client.sendFile(requester.chatId, url, 'file', signature + caption);
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
			return this.client.sendFile(
				requester.chatId,
				base64,
				'file',
				signature + caption
			);
		} catch (e) {
			this.replyAuthor(JSON.stringify(e), requester);
		}
	}

	sendFileFromPath(path: string, caption: string = '', requester: Message) {
		try {
			return this.client.sendFile(
				requester.chatId,
				path,
				'file',
				signature + caption,
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

		return this.client.sendFile(requester.chatId, base64, 'file', signature);
	}

	async isAdmin(requester: Message) {
		if (!requester.isGroupMsg) return true;
		const allAdmins = await this.client.getGroupAdmins(
			requester.chat.groupMetadata.id
		);
		return allAdmins.includes(requester.sender.id);
	}

	async iAmAdmin(requester: Message) {
		if (!requester.isGroupMsg) return true;
		const allAdmins = await this.client.getGroupAdmins(
			requester.chat.groupMetadata.id
		);
		const me = await this.client.getMe();
		return allAdmins.includes(me.status);
	}

	async sendImageFromSticker(requester: Message, stickerMsg: Message) {
		try {
			const stickerBuffer = await decryptMedia(stickerMsg);
			return this.client.sendFile(
				requester.chatId,
				this.getBase64fromBuffer(stickerBuffer, 'image'),
				'Gramonta-bot',
				signature,
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
				signature,
				requester.id
			);
		} catch (e) {
			console.warn(e);
		}
	}

	async react(emoji: string, requester: Message) {
		return this.client.react(requester.id, emoji);
	}

	async getMentionedPeople(requester: Message) {
		return requester.mentionedJidList;
	}

	async getNumberFromContactId(contactId: ContactId): Promise<string> {
		return contactId.split('@')[0];
	}

	async getContactInfoFromContactId(contactId: ContactId) {
		return this.client.getContact(contactId);
	}

	async banFromGroup(requester: Message, participantId: ContactId) {
		return this.client.removeParticipant(
			requester.chat.groupMetadata.id,
			participantId
		);
	}

	async deleteMessage(message: Message) {
		return this.client.deleteMessage(message.chatId, message.id);
	}

	async fetchMessageDetails(messageId: MessageId) {
		return this.client.getMessageById(messageId);
	}
}

export default Zaplify;
