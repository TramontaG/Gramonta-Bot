import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import axios from 'axios';
import { Message } from '@open-wa/wa-automate';

const signos = [
	'aries',
	'touro',
	'gemeos',
	'gêmeos',
	'cancer',
	'câncer',
	'leao',
	'leão',
	'escorpiao',
	'escorpião',
	'libra',
	'sagitario',
	'sagitário',
	'capricornio',
	'capricórnio',
	'aquario',
	'aquário',
	'peixes',
	'virgem',
];

class Horoscopo extends Module {
	constructor() {
		super();
		this.registerPublicMethod({
			name: 'help',
			method: this.sendInstructions.bind(this),
		});
		this.registerPublicMethod({
			name: 'default',
			method: this.sendInstructions.bind(this),
		});
		signos.forEach(signo => {
			this.registerPublicMethod({
				name: signo,
				method: () => this.default(signo),
			});
		});
	}

	async default(signo: string) {
		const requester = this.zaplify?.messageObject as any;
		this.zaplify?.replyAuthor('Indo até as estrelas pra buscar sua sorte...');
		axios.get(`https://horoscopefree.herokuapp.com/daily/pt/`).then(resp => {
			switch (signo) {
				case 'aries':
					return this.zaplify?.replyAuthor(`${resp.data.aries}`, requester);
				case 'touro':
					return this.zaplify?.replyAuthor(`${resp.data.taurus}`, requester);
				case 'gemeos':
				case 'gêmeos':
					return this.zaplify?.replyAuthor(`${resp.data.gemini}`, requester);
				case 'cancer':
				case 'câncer':
					return this.zaplify?.replyAuthor(`${resp.data.cancer}`, requester);
				case 'leao':
				case 'leão':
					return this.zaplify?.replyAuthor(`${resp.data.leo}`, requester);
				case 'escorpiao':
				case 'escorpião':
					return this.zaplify?.replyAuthor(`${resp.data.scorpio}`, requester);
				case 'libra':
					return this.zaplify?.replyAuthor(`${resp.data.libra}`, requester);
				case 'sagitario':
				case 'sagitário':
					return this.zaplify?.replyAuthor(`${resp.data.sagittarius}`), requester;
				case 'capricornio':
				case 'capricórnio':
					return this.zaplify?.replyAuthor(`${resp.data.capricorn}`, requester);
				case 'aquario':
				case 'aquário':
					return this.zaplify?.replyAuthor(`${resp.data.aquarius}`, requester);
				case 'peixes':
					return this.zaplify?.replyAuthor(`${resp.data.pisces}`, requester);
				case 'virgem':
					return this.zaplify?.replyAuthor(`${resp.data.virgo}`, requester);
				default:
					return this.zaplify?.replyAuthor(`Não encontrei nada...`, requester);
			}
		});
	}

	async sendInstructions() {
		fs.readFile('src/Modules/Horoscopo/Help.txt', {
			encoding: 'utf-8',
		}).then(helpText => {
			this.zaplify?.replyAuthor(helpText);
		});
	}
}

export default new Horoscopo();
