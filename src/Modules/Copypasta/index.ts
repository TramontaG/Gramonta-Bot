import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import * as CopypastaManager from './CopypastaManager';

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
				(str, fileName, index) => (str += `${index + 1} - ${fileName}`),
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

		const copypastaName = args.immediate.split(' ')[1];

		CopypastaManager.newCopýPasta(copypastaName, requester.quotedMsg.body);

		this.registerPublicMethod({
			name: copypastaName,
			method: () => this.getCopypasta(copypastaName),
		});
	}

	async getCopypasta(copypastaName: string) {
		console.log('SENDING COPYPASTA', copypastaName);
		const requester = this.zaplify?.messageObject as Message;
		const copypasta = await CopypastaManager.getCopyPasta(copypastaName);
		this.zaplify?.replyAuthor(copypasta, requester);
	}
}

export default new Copypasta();
