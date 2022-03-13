import { Message } from '@open-wa/wa-automate';
import { Button } from '@open-wa/wa-automate/dist/api/model/button';
import {
	Req,
	Res,
	Reply,
	TimelessReply,
	MockedMessageObject,
	MessageType,
} from './Models';
import FS from 'fs/promises';

class MockedClient {
	req: Req | null;
	res: Res | null;
	messageObject: MockedMessageObject | null;

	replyQueue: Reply[];

	constructor() {
		this.req = null;
		this.res = null;
		this.messageObject = null;
		this.replyQueue = [];
	}

	static instance: MockedClient | null;

	static getInstance(req: Req, res: Res) {
		if (!this.instance) this.instance = new MockedClient();
		this.instance.setRequest(req, res);
		return this.instance;
	}

	private setRequest(req: Req, res: Res) {
		this.req = req;
		this.res = res;
	}

	private addReplyToQueue(reply: TimelessReply) {
		this.replyQueue.push({
			...reply,
			timestamp: new Date().toString(),
		});
	}

	sendReplyQueue() {
		if (!this.res) throw 'response object not initialized';
		this.res.send({
			messages: this.replyQueue,
		});
		this.replyQueue = [];
	}

	replyAuthor(message: string, requester?: MockedMessageObject) {
		this.addReplyToQueue({
			textContent: message,
			quoteMessageId: requester?.id,
			type: MessageType.TEXT,
		});
	}

	sendMessage(message: string, requester?: MockedMessageObject) {
		this.addReplyToQueue({
			type: MessageType.TEXT,
			textContent: message,
			quoteMessageId: requester?.id,
		});
	}

	getMediaBufferFromMessage(messageObject: unknown) {
		return undefined;
	}

	getSticker(messageObject: unknown) {
		return undefined;
	}

	sendSticker(stickerImage: Buffer, requester: unknown) {
		this.addReplyToQueue({
			mediaData: stickerImage,
			quoteMessageId: requester as string,
			type: MessageType.STICKER,
		});
	}

	sendVideoSticker(stickerImage: Buffer, requester: unknown) {
		this.addReplyToQueue({
			mediaData: stickerImage,
			quoteMessageId: requester as string,
			type: MessageType.ANIMATED_STICKER,
		});
	}

	sendButtons(captions: string, buttons: Button[], _?: MockedMessageObject) {
		this.addReplyToQueue({
			textContent: captions,
			buttons,
			type: MessageType.BUTTONS,
		});
	}

	sendSong(fileAddress: string, caption: string, _?: MockedMessageObject) {
		FS.readFile(fileAddress).then(songBuffer => {
			this.addReplyToQueue({
				mediaData: songBuffer,
				type: MessageType.AUDIO,
				textContent: caption,
			});
		});
	}

	sendImageFromUrl(title: string, thumbnail: string, _?: MockedMessageObject) {
		this.addReplyToQueue({
			type: MessageType.IMAGE,
			mediaData: thumbnail,
			textContent: title,
		});
	}
}

export default MockedClient;
