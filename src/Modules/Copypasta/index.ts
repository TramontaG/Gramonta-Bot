import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import * as CopypastaManager from './CopypastaManager';
import fs from 'fs/promises';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';

class Copypasta extends Module {
	logger: Logger;

	constructor() {
		super();
		this.logger = new Logger();

		this.registerPublicMethod({
			name: 'all',
			method: this.getCopypastaList.bind(this),
		});

		this.registerPublicMethod({
			name: 'new',
			method: this.newCopypasta.bind(this),
		});

		this.registerPublicMethod({
			name: 'help',
			method: this.sendHelp.bind(this),
		});

		this.registerPublicMethod({
			name: 'default',
			method: this.sendHelp.bind(this),
		});

		this.registerPublicMethod({
			name: 'search',
			method: this.searchCopypasta.bind(this),
		});

		this.registerPublicMethod({
			name: 'number',
			method: this.sendCopypastaByIndex.bind(this),
		});

		CopypastaManager.getCopypstaList().then(copypastaList => {
			copypastaList.forEach(item => {
				this.registerPublicMethod({
					name: item.copypastaName,
					method: () => this.sendCopypastaByName(item.copypastaName),
				});
			});
		});
	}

	async getCopypastaList() {
		const requester = this.zaplify?.messageObject as Message;
		try {
			const copypastaList = await CopypastaManager.getCopypstaList();

			const myCopypastas = copypastaList.reduce(
				(str, copypasta) =>
					(str += `${copypasta.index} - ${copypasta.copypastaName}\n`),
				'*_Lista de copypastas:_*\n'
			);

			this.zaplify?.replyAuthor(myCopypastas, requester);
		} catch (e) {
			this.zaplify?.replyAuthor(JSON.stringify(e), requester);
		}
	}

	async newCopypasta(args: Args) {
		const requester = this.zaplify?.messageObject as Message;

		if (!requester.quotedMsg)
			return this.zaplify?.replyAuthor('Deu ruim', requester);
		if (!args.immediate)
			return this.zaplify?.replyAuthor('Preciso de um nome', requester);
		if (['new', 'all'].includes(args.immediate))
			return this.zaplify?.replyAuthor('Nome proibido', requester);

		const copypastaName = args.immediate.split(' ')[1];
		const copypastaList = await CopypastaManager.getCopypstaList();
		const copypastaAlreadyExists =
			copypastaList.filter(item => item.copypastaName === copypastaName).length > 0;

		if (copypastaAlreadyExists)
			return this.zaplify?.replyAuthor('Essa copypasta já existe!', requester);

		CopypastaManager.newCopyPasta(copypastaName, requester.quotedMsg.body);

		this.registerPublicMethod({
			name: copypastaName,
			method: () => this.sendCopypastaByName(copypastaName),
		});

		this.zaplify?.replyAuthor(
			`Copypasta adicionado com sucesso. Para fazer o bot envia-la digite *_!copypasta ${copypastaName}_*`,
			requester
		);
	}

	async searchCopypasta(args: Args) {
		const query = args.immediate;
		if (!query) return this.zaplify?.replyAuthor('Preciso de algo pra pesquisar');

		const requester = this.zaplify?.messageObject as Message;
		const results = await CopypastaManager.searchCopyPasta(query.trim());

		const message = results.reduce((msg, result) => {
			return (msg += `${result.index} - ${result.copypastaName}\n`);
		}, '*_RESULTADOS:_*\n\n');

		this.zaplify?.replyAuthor(message, requester);
	}

	async sendCopypastaByName(copypastaName: string) {
		const requester = this.zaplify?.messageObject as Message;
		const copypasta = await CopypastaManager.getCopyPastaByName(copypastaName);
		this.zaplify?.replyAuthor(copypasta, requester);

		this.logger.insertNew(EntityTypes.COPYPASTAS, {
			groupName: requester.isGroupMsg ? requester.chat.name : '_',
			chatId: requester.chat.id,
			requester: requester.sender.formattedName,
			copypastaName,
			date: new Date().getTime(),
		});
	}

	async sendCopypastaByIndex(args: Args) {
		const requester = this.zaplify?.messageObject as Message;
		const indexInText = args.immediate?.trim();
		if (!indexInText)
			return this.zaplify?.replyAuthor('Insira o número da copypasta', requester);
		if (indexInText.match(/[^0-9]/g))
			return this.zaplify?.replyAuthor('Insira número, seu macaco!', requester);

		try {
			const index = Number(indexInText);
			const result = await CopypastaManager.getCopyPastaByIndex(index - 1);
			console.log(result);

			this.zaplify?.replyAuthor(result.copypasta, requester);

			this.logger.insertNew(EntityTypes.COPYPASTAS, {
				groupName: requester.isGroupMsg ? requester.chat.name : '_',
				chatId: requester.chat.id,
				requester: requester.sender.formattedName,
				copypastaName: result.copypastaName.copypastaName,
				date: new Date().getTime(),
			});
		} catch (e) {
			this.zaplify?.replyAuthor(e as string, requester);
		}
	}

	async sendHelp() {
		const requester = this.zaplify?.messageObject;
		const helpText = await fs.readFile('src/Modules/Copypasta/Help.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText, requester as Message);
	}
}

export default Copypasta;
