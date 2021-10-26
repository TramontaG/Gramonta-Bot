import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import API from './API,';
import fs from 'fs/promises';

class LyricsFinder extends Module {
	constructor() {
		super();
		this.registerPublicMethod({
			name: 'get',
			method: this.firstSong.bind(this),
		});

		this.registerPublicMethod({
			name: 'help',
			method: this.help.bind(this),
		});

		this.registerPublicMethod({
			name: 'default',
			method: this.help.bind(this),
		});
	}

	async firstSong(args: Args) {
		try {
			const requester = this.zaplify?.messageObject as Message;
			const query = args.immediate;

			if (!query) throw 'Por favor, insira algo para eu pesquisar!';

			const result = await API.firstSong(query);
			if (!result) return this.zaplify?.replyAuthor('Não encontrei nada', requester);

			this.zaplify?.replyAuthor(result, requester);
		} catch (e) {
			this.zaplify?.replyAuthor('Erro desconhecido:' + e);
		}
	}

	async help() {
		const helpText = await fs.readFile('src/Modules/Lyrics/Help.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText);
	}
}

export default new LyricsFinder();
