import { Args, Module } from '../ModulesRegister';
import ImageSearch from 'google-images';
import { Message } from '@open-wa/wa-automate';
import GoogleSearch from './GoogleWebSearcher';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';
import { getAudioUrl } from 'google-tts-api';
import fs from 'fs/promises';
import axios from 'axios';

interface GoogleArgs extends Args {
	imgamount?: string;
	lang?: string;
}

class Google extends Module {
	GoogleImage: ImageSearch | null;
	GoogleSearch: GoogleSearch | null;
	logger: Logger;

	constructor() {
		super();
		this.GoogleImage = null;
		this.GoogleSearch = null;

		this.logger = new Logger();

		this.registerPublicMethod({
			name: 'help',
			method: this.help.bind(this),
		});
		this.registerPublicMethod({
			name: 'default',
			method: this.help.bind(this),
		});
		this.registerPublicMethod({
			name: 'image',
			method: this.image.bind(this),
		});
		this.registerPublicMethod({
			name: 'web',
			method: this.web.bind(this),
		});
		this.registerPublicMethod({
			name: 'speak',
			method: this.speak.bind(this),
		});
	}

	async speak(args: GoogleArgs, requester: Message) {
		const text = args.immediate?.substr(0, 199);
		const lang = args.lang;
		try {
			// if (!text)
			const audioUrl = getAudioUrl(text!, {
				lang: lang || 'pt_BR',
			});

			// return;

			// return this.zaplify?.replyAuthor(
			// 	'A voz do google ta bugada. Já já conserto!',
			// 	requester
			// );

			return this.zaplify?.sendFileFromUrl(audioUrl, 'googleTts.ogg', requester);
		} catch (e) {
			return this.zaplify?.replyAuthor('Erro: ' + e, requester);
		}
	}

	async replySpeak(args: GoogleArgs) {
		const requester = this.zaplify?.messageObject as Message;
		const quotedRequester = requester.quotedMsgObj;
		const lang = args.lang;
		try {
			if (!quotedRequester)
				return this.zaplify?.replyAuthor(
					'Responda uma mensagem para eu narrar',
					requester
				);

			const text = quotedRequester.body.substr(0, 199);
			const audioUrl = getAudioUrl(text, {
				lang: lang || 'pt_BR',
			});
			return this.zaplify?.sendFileFromUrl(audioUrl, 'googleTts', requester);
		} catch (e) {
			this.zaplify?.replyAuthor('Erro:' + e, requester);
		}
	}

	async image(args: GoogleArgs, requester: Message) {
		const query = args.immediate;
		if (!query) return this.showError('Envie algo para buscar', requester);
		try {
			const imgAmount = Number(args.imgamount) || 5;
			const results = await this.getImageSearcher()
				.search(query, {
					safe: 'high',
				})
				.catch(e => {
					throw e;
				});
			let amountSend = 0;

			results.forEach(result => {
				if (amountSend >= imgAmount) return;
				if (result.type !== 'image/jpeg') return;
				if (!result.url.startsWith('https')) return;

				// @ts-ignore
				const caption = `${result.description}\n\n${result.parentPage}`;
				try {
					axios
						.get(result.url)
						.then(() =>
							this.zaplify?.sendImageFromUrl(result.url, caption, requester)
						)
						.catch(e => console.warn(e));
				} catch (e) {
					console.warn(e);
				}

				amountSend++;
			});

			this.logger.insertNew(EntityTypes.GOOGLESEARCHES, {
				groupName: requester.isGroupMsg ? requester.chat.name : '_',
				chatId: requester.chat.id,
				requester: requester.sender.formattedName,
				query,
				type: 'image',
				date: new Date().getTime(),
			});
		} catch (e) {
			console.log(e);
			this.zaplify?.replyAuthor(`Erro inesperado: ${e}`, requester);
		}
	}

	// search(args: GoogleArgs, requester: Message) {
	// 	try {
	// 		if (!args.immediate)
	// 			return this.showError('Preciso de algo para pesquisar', requester);
	// 		this.zaplify?.sendButtons(`Como deseja pesquisar ${args.immediate}?`, [
	// 			{
	// 				id: `!google web ${args.immediate}`,
	// 				text: 'Pesquisa Web',
	// 			},
	// 			{
	// 				id: `!google image ${args.immediate}`,
	// 				text: 'Imagens',
	// 			},
	// 			"",
	// 			""
	// 		]);
	// 	} catch (e) {
	// 		this.showError(`${e}`, requester);
	// 	}
	// }

	async help(_: Args, requester: Message) {
		fs.readFile('src/Modules/Google/Help.txt', {
			encoding: 'utf-8',
		}).then(helpText => {
			this.zaplify?.replyAuthor(helpText, requester);
		});
	}

	web(args: GoogleArgs, requester: Message) {
		try {
			if (!args.immediate)
				return this.showError('Envie algo para eu pesquisar', requester);
			const query = args.immediate;

			this.logger.insertNew(EntityTypes.GOOGLESEARCHES, {
				groupName: requester.isGroupMsg ? requester.chat.name : '_',
				chatId: requester.chat.id,
				requester: requester.sender.formattedName,
				query: args.immediate,
				type: 'web',
				date: new Date().getTime(),
			});

			this.getWebSearcher()
				.search(query)
				.then(({ data }) => {
					const { searchInformation } = data;

					if (!data.items) {
						this.zaplify?.replyAuthor('Não encontrei nada', requester);
						return;
					}

					let response = ``;
					response += `*_O google encontrou ${searchInformation.totalResults} em ${searchInformation.formattedSearchTime} segundos_*`;
					response += `\n\n`;
					response += data.items.reduce((string: string, result: any) => {
						let resultString = ``;
						resultString += `*${result.title}*\n`;
						resultString += `${result.snippet}\n`;
						resultString += `${result.link}\n\n`;
						return string + resultString;
					}, ``);
					this.zaplify?.replyAuthor(response, this.requester as Message);
				});
		} catch (e) {
			this.showError(`${e}`, requester);
		}
	}

	private showError(error: string, requester: Message) {
		this.zaplify?.replyAuthor(`Erro: ${error}`, requester);
	}

	private getImageSearcher() {
		if (!this.GoogleImage)
			this.GoogleImage = new ImageSearch(
				process.env.GOOGLE_CSE_KEY as string,
				process.env.GOOGLE_KEY as string
			);
		return this.GoogleImage;
	}
	private getWebSearcher() {
		if (!this.GoogleSearch)
			this.GoogleSearch = new GoogleSearch(
				process.env.GOOGLE_KEY as string,
				process.env.GOOGLE_CSE_KEY as string
			);
		return this.GoogleSearch;
	}
}

export default Google;
