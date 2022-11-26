import { Message, MessageId } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import API from './API,';
import fs from 'fs/promises';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';

class LyricsFinder extends Module {
	logger: Logger;

	constructor() {
		super();
		this.logger = new Logger();

		this.makePublic('get', this.firstSong);
		this.makePublic('help', this.help);
		this.makePublic('default', this.firstSong);
	}

	async firstSong(args: Args, requester: Message) {
		try {
			const query = args.method + args.immediate;

			if (!query) throw 'Por favor, insira algo para eu pesquisar!';

			const result = await API.firstSong(query);
			if (!result) return this.zaplify?.replyAuthor('Não encontrei nada', requester);

			this.logger.insertNew(EntityTypes.LYRICS, {
				query,
				groupName: requester.isGroupMsg ? requester.chat.name : '_',
				chatId: requester.chat.id,
				requester: requester.sender.formattedName,
				date: new Date().getTime(),
			});

			return this.zaplify?.replyAuthor(result, requester);
		} catch (e) {
			return this.zaplify?.replyAuthor('Erro desconhecido:' + e, requester);
		}
	}

	async help(_: Args, requester: Message) {
		const helpText = await fs.readFile('src/Modules/Lyrics/Help.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText, requester);
	}
}

export default LyricsFinder;
