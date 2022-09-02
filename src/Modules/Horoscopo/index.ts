import { Module } from '../ModulesRegister';
import fs from 'fs/promises';
import axios from 'axios';
import Logger from '../Logger/Logger';
import { EntityTypes } from '../../BigData/JsonDB';
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
	logger: Logger;
	constructor() {
		super();
		this.logger = new Logger();

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
		const requester = this.zaplify?.messageObject as Message;

		try {
			if (!requester.id.startsWith('Debug')) {
				this.logger.insertNew(EntityTypes.HOROSCOPE, {
					groupName: requester.isGroupMsg ? requester.chat.name : '_',
					chatId: requester.chatId,
					requester: requester.sender.formattedName,
					sign: signo,
					date: new Date().getTime(),
				});
			}

			const resp = await axios.get(`https://horoscopefree.herokuapp.com/daily/pt/`);

			switch (signo) {
				case 'aries':
				case 'áries':
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
					return this.zaplify?.replyAuthor(`${resp.data.sagittarius}`, requester);
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
		} catch (e) {
			this.zaplify?.replyAuthor(
				'Erro ao pesquisar seu horóscopo, tente novamente mais tarde',
				requester
			);
		}
	}

	async sendInstructions() {
		return fs
			.readFile('src/Modules/Horoscopo/Help.txt', {
				encoding: 'utf-8',
			})
			.then(helpText => {
				this.zaplify?.replyAuthor(helpText);
			});
	}
}

export default Horoscopo;
