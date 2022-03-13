import { Message } from '@open-wa/wa-automate';
import { Button } from '@open-wa/wa-automate/dist/api/model/button';
import { Request, Response } from 'express';

export type Req = Request<{}, any, any, any, Record<string, any>>;
export type Res = Response<any, Record<string, any>>;

export enum MessageType {
	AUDIO = 'Audio',
	IMAGE = 'Image',
	STICKER = 'Sticker',
	ANIMATED_STICKER = 'Animated Sticker',
	VIDEO = 'Video',
	TEXT = 'Text',
	BUTTONS = 'Buttons',
}

export type Reply = {
	timestamp: string;
	textContent?: string;
	mediaData?: Buffer | string;
	caption?: string;
	quoteMessageId?: string;
	buttons?: Button[];
};

export type TimelessReply = {
	[key in Exclude<keyof Reply, 'timestamp'>]?: Reply[key];
} & {
	type: MessageType;
};

export type MockedMessageObject = {
	[key in keyof Message]?: Message[key];
};
