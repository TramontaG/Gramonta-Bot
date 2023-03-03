import { Args, Module } from '../ModulesRegister';
import { Message, MessageTypes } from '@open-wa/wa-automate';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';
import { getAudioUrl } from 'google-tts-api';
import GoogleAPI from './GoogleAPI';
import { bold } from 'src/Helpers/TextFormatter';

interface GoogleArgs extends Args {
	imgamount?: string;
	lang?: string;
}

class Google extends Module {
	logger: Logger;
	googleAPI: GoogleAPI;

	constructor() {
		super();

		this.googleAPI = new GoogleAPI(
			process.env.GOOGLE_KEY!,
			process.env.GOOGLE_CSE_KEY!
		);

		this.logger = new Logger();

		this.makePublic('help', this.help);
		this.makePublic('image', this.image);
		this.makePublic('web', this.web);
		this.makePublic('speak', this.speak);
		this.makePublic('default', this.help);
		this.makePublic('search', this.search);

		this.messagesPath = './src/Modules/Google/messages.zap.md';
	}

	async speak(args: GoogleArgs, requester: Message) {
		try {
			const text = args.immediate;
			const lang = args.lang;

			if (!text) {
				return this.sendMessageFromTemplate('NoTextToSpeak', requester);
			}

			if (text.length > 200) {
				this.sendMessageFromTemplate('MaxCharsExceeded', requester);
			}

			const audioUrl = getAudioUrl(text.substring(0, 199), {
				lang: lang || 'pt_BR',
			});

			return this.zaplify?.sendFileFromUrl(audioUrl, 'googleTts.ogg', requester);
		} catch (e) {
			return this.sendMessageFromTemplate('Error', requester, {
				error: e,
			});
		}
	}

	async replySpeak(args: GoogleArgs, requester: Message) {
		try {
			const quotedMessage = requester.quotedMsgObj;
			const lang = args.lang;

			if (!quotedMessage) {
				return this.sendMessageFromTemplate('NoQuoteToTTS', requester);
			}

			if (quotedMessage.type !== MessageTypes.TEXT) {
				return this.sendMessageFromTemplate('OnlyTextMessages', requester);
			}

			const text = quotedMessage.body;

			if (text.length > 200) {
				this.sendMessageFromTemplate('MaxCharsExceeded', requester);
			}

			const audioUrl = getAudioUrl(text.substring(0, 199), {
				lang: lang || 'pt_BR',
			});

			return this.zaplify?.sendFileFromUrl(audioUrl, 'googleTts', requester);
		} catch (e) {
			return this.sendMessageFromTemplate('Error', requester, {
				error: e,
			});
		}
	}

	async image(args: GoogleArgs, requester: Message) {
		try {
			const query = args.immediate;
			if (!query) {
				return this.sendMessageFromTemplate('EmptyQuery', requester);
			}

			const imgAmount = Number(args.imgamount) || 3;

			const results = await this.googleAPI.searchImages(query, imgAmount);

			if (results.length === 0) {
				return this.sendMessageFromTemplate('NoResults', requester);
			}

			this.logGoogleSearch(query, requester, 'image');

			results.forEach(result => {
				// The typing of the library is wrong.
				// @ts-ignore
				const caption = `${result.description}\n\n${result.parentPage}`;
				this.zaplify.sendImageFromUrl(result.url, caption, requester);
			});
		} catch (e) {
			this.sendMessageFromTemplate('Error', requester, {
				error: e,
			});
		}
	}

	search(args: GoogleArgs, requester: Message) {
		try {
			const query = args.immediate;

			if (!query) {
				return this.sendMessageFromTemplate('EmptyQuery', requester);
			}

			this.zaplify.sendButtons(
				`Como deseja pesquisar ${query}?`,
				[
					{
						id: `!google web ${query}`,
						text: 'Pesquisa Web',
					},
					{
						id: `!google image ${query}`,
						text: 'Imagens',
					},
				],
				requester
			);
		} catch (e) {
			this.sendMessageFromTemplate('Error', requester, {
				error: e,
			});
		}
	}

	async web(args: GoogleArgs, requester: Message) {
		try {
			const query = args.immediate;

			if (!query) {
				return this.sendMessageFromTemplate('EmptyQuery', requester);
			}

			this.logGoogleSearch('query', requester, 'web');

			const { searchInformation, items } = await this.googleAPI.searchWeb(query);

			if (!items) {
				this.zaplify?.replyAuthor('Não encontrei nada', requester);
				return;
			}

			this.sendMessageFromTemplate('SearchResults', requester, {
				totalResults: searchInformation.formattedTotalResults.replace(/,/g, '.'),
				searchTime: searchInformation.formattedSearchTime,
				results: items.reduce((string: string, result: any) => {
					return (string += [
						bold(result.title),
						result.snippet,
						result.link,
						'\n',
					].join('\n'));
				}, ''),
			});
		} catch (e) {
			this.sendMessageFromTemplate('Error', requester, {
				error: e,
			});
		}
	}

	async help(_: Args, requester: Message) {
		this.sendMessageFromTemplate('Help', requester);
	}

	private logGoogleSearch(query: string, requester: Message, type: 'web' | 'image') {
		this.logger.insertNew(EntityTypes.GOOGLESEARCHES, {
			groupName: requester.isGroupMsg ? requester.chat.name : '_',
			chatId: requester.chat.id,
			requester: requester.sender.formattedName,
			query,
			type,
			date: new Date().getTime(),
		});
	}
}

export default Google;
