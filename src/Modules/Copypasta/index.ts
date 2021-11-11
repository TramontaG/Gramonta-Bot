import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import * as CopypastaManager from './CopypastaManager';
import fs from 'fs/promises';

class Copypasta extends Module {
	constructor() {
		super();

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

		CopypastaManager.getCopypstaList().then(copypastaList => {
			console.log('COPYPASTA LIST', copypastaList);
			copypastaList.forEach(copypastaName => {
				console.log('REGISTERING COPYPASTA', copypastaName);
				this.registerPublicMethod({
					name: copypastaName,
					method: () => this.getCopypasta(copypastaName),
				});
			});
		});
	}

	async getCopypastaList() {
		const requester = this.zaplify?.messageObject as Message;
		try {
			const files = await CopypastaManager.getCopypstaList();
			console.log(files);

			const myCopypastas = files.reduce(
				(str, fileName, index) => (str += `${index + 1} - ${fileName}\n`),
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

		const copypastaAlreadyExists = (
			await CopypastaManager.getCopypstaList()
		).includes(copypastaName);
		if (copypastaAlreadyExists)
			return this.zaplify?.replyAuthor('Essa copypasta já existe!', requester);

		CopypastaManager.newCopyPasta(copypastaName, requester.quotedMsg.body);

		this.registerPublicMethod({
			name: copypastaName,
			method: () => this.getCopypasta(copypastaName),
		});

		this.zaplify?.replyAuthor(
			`Copypasta adicionado com sucesso. Para fazer o bot envia-la digite *_!copypasta ${copypastaName}_*`,
			requester
		);
	}

	async getCopypasta(copypastaName: string) {
		const requester = this.zaplify?.messageObject as Message;
		const copypasta = await CopypastaManager.getCopyPasta(copypastaName);
		this.zaplify?.replyAuthor(copypasta, requester);
	}

	async sendHelp() {
		const requester = this.zaplify?.messageObject;
		const helpText = await fs.readFile('src/Modules/Copypasta/Help.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText, requester as Message);
	}
}

export default new Copypasta();
