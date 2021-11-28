import { Args, Module } from '../ModulesRegister';
import ImageSearch from 'google-images';
import { Message } from '@open-wa/wa-automate';
import GoogleSearch from './GoogleWebSearcher';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';

interface GoogleArgs extends Args {
	imgamount?: string;
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
			name: 'image',
			method: this.image.bind(this),
		});
		this.registerPublicMethod({
			name: 'web',
			method: this.web.bind(this),
		});
		this.registerPublicMethod({
			name: 'search',
			method: this.search.bind(this),
		});
	}

	async image(args: GoogleArgs) {
		const query = args.immediate;
		if (!query) return this.showError('Envie algo para buscar');
		const requester = this.requester as Message;
		try {
			const imgAmount = Number(args.imgamount) || 5;
			const results = await this.getImageSearcher().search(query, {
				safe: 'high',
			});
			let amountSend = 0;
			results.forEach(result => {
				if (amountSend >= imgAmount) return;
				if (result.type !== 'image/jpeg') return;
				if (!result.url.startsWith('https')) return;

				// @ts-ignore
				const caption = `${result.description}\n\n${result.parentPage}`;
				this.zaplify?.sendImageFromUrl(
					result.url,
					caption,
					this.requester as Message
				);
				amountSend++;
			});

			const requester = this.zaplify?.messageObject as Message;

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
			this.zaplify?.replyAuthor(`Erro inesperado: ${e}`);
		}
	}

	search(args: GoogleArgs) {
		try {
			if (!args.immediate) return this.showError('Preciso de algo para pesquisar');
			this.zaplify?.sendButtons(`Como deseja pesquisar ${args.immediate}?`, [
				{
					id: `!google web ${args.immediate}`,
					text: 'Pesquisa Web',
				},
				{
					id: `!google image ${args.immediate}`,
					text: 'Imagens',
				},
			]);
		} catch (e) {
			this.showError(`${e}`);
		}
	}

	help() {
		this.zaplify?.replyAuthor('TODO', this.requester as Message);
	}

	web(args: GoogleArgs) {
		try {
			if (!args.immediate) return this.showError('Envie algo para eu pesquisar');
			const query = args.immediate;
			const requester = this.zaplify?.messageObject as Message;

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
			this.showError(`${e}`);
		}
	}

	private showError(error: string) {
		this.zaplify?.replyAuthor(`Erro: ${error}`);
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

export default new Google();
