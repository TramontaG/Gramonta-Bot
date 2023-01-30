import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import axios from 'axios';
import Logger from '../Logger/Logger';
import { EntityTypes } from '../../BigData/JsonDB';
import { Message } from '@open-wa/wa-automate';
import { normalizeString } from 'src/Helpers/TextFormatter';
import Horoscope from './API';

class Horoscopo extends Module {
	logger: Logger;
	Api: Horoscope;

	constructor() {
		super();
		this.logger = new Logger();
		this.Api = new Horoscope();

		this.makePublic('default', this.default);
		this.makePublic('help', this.help);

		this.messagesPath = './src/Modules/Horoscopo/messages.zap.md';
	}

	async default(args: Args, requester: Message) {
		const signo = normalizeString(args.method);

		try {
			const horoscope = await this.Api.getDaily(signo);

			if (!horoscope) {
				return this.sendMessageFromTemplate('NotFound', requester);
			}

			this.log(requester, horoscope);

			return this.sendMessageFromTemplate('Horoscope', requester, {
				horoscope,
			});
		} catch (e) {
			return this.sendMessageFromTemplate('Error', requester, {
				error: e,
			});
		}
	}

	private log(requester: Message, signo: string) {
		this.logger.insertNew(EntityTypes.HOROSCOPE, {
			groupName: requester.isGroupMsg ? requester.chat.name : '_',
			chatId: requester.chatId,
			requester: requester.sender.formattedName,
			sign: signo,
			date: new Date().getTime(),
		});
	}

	async help(_: Args, requester: Message) {
		return this.sendMessageFromTemplate('Help', requester);
	}
}

export default Horoscopo;
