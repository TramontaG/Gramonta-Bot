import { Message } from '@open-wa/wa-automate';
import { bold, monospace } from 'src/Helpers/TextFormatter';
import { Args, Module } from '../ModulesRegister';
import MemeApi from './MemeApi';
import { MemeCreationModel, MemeCreationObject } from './Models';
import fs from 'fs/promises';
import Logger from '../Logger/Logger';

type MemeArgs = Args & {
	amount?: string;
	text?: string;
};

class MemeModule extends Module {
	memeAPI: MemeApi;
	logger: Logger;

	constructor() {
		super();
		this.memeAPI = new MemeApi();
		this.logger = new Logger();

		this.registerPublicMethod({
			name: 'search',
			method: (args: MemeArgs, requester: Message) => this.searchMeme(args, false, requester),
		});

		this.registerPublicMethod({
			name: 'create',
			method: this.createMeme.bind(this),
		});

		this.registerPublicMethod({
			name: 'default',
			method: this.sendHelp.bind(this),
		});

		this.registerPublicMethod({
			name: 'random',
			method: (args: MemeArgs, requester: Message) => this.searchMeme(args, true, requester),
		});
	}

	async searchMeme(args: MemeArgs, random: boolean, requester: Message) {
		const query = args.immediate?.trim();

		if (!query && !random)
			return this.zaplify?.replyAuthor(
				'Insira alguma coisa pra eu pesquisar',
				requester
			);

		const amountString = args.amount;
		let amount = 5;
		if (amountString && !amountString.match(/[^0-9]/)) {
			amount = Number(amountString);
		}

		const memeList = await this.memeAPI.searchMeme(query ?? '');

		memeList
			.sort(() => Math.random() - 0.5)
			.slice(0, amount - 1)

			.forEach(meme => {
				this.zaplify?.sendImageFromUrl(
					meme.url,
					[
						`${monospace(meme.name)}`,
						`${monospace('Caixas de texto:')} ${bold(meme.box_count.toString())}`,
						`${monospace('ID do meme:')} ${'#' + meme.id}`,
					].join('\n'),
					requester
				);
			});
	}

	async createMeme(args: MemeArgs) {
		const requester = this.zaplify?.messageObject as Message;
		const id = requester.quotedMsg?.caption.split('#')[1];
		const textArray = args.immediate
			?.trim()
			.split('@')
			.filter(text => text !== '');

		if (!id)
			return this.zaplify?.replyAuthor(
				'Preciso de algum meme com ID. Para saber como funciono, digite !meme help',
				requester
			);

		if (!textArray)
			return this.zaplify?.replyAuthor('Envie os textos para a criação do meme!');

		const memeJson: MemeCreationModel = {};
		textArray.forEach((text, index) => {
			memeJson['text' + index] = text;
		});

		const createdMeme = await this.memeAPI.createMeme(id, memeJson);

		if (!createdMeme.success)
			return this.zaplify?.replyAuthor(
				'Ih, deu erro, se liga: ' + JSON.stringify(createdMeme.data),
				requester
			);

		this.logger.insertNew('meme', {
			groupName: requester.isGroupMsg ? requester.chat.name : '_',
			chatId: requester.chat.id,
			requester: requester.sender.formattedName,
			date: new Date().getTime(),
			memeId: id,
		});

		this.zaplify?.sendImageFromUrl(
			createdMeme.data.url,
			`Se liga como ficou teu meme ae`,
			requester
		);
	}

	async sendHelp() {
		const requester = this.zaplify?.messageObject;
		const helpText = await fs.readFile('src/Modules/MemeMaker/Help.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText, requester as Message);
	}
}

export default MemeModule;
