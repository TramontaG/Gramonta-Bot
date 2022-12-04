import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import TranslateService from '../Translate/TranslationService';
import BoredApi from './API';

class Bored extends Module {
	API: BoredApi;
	TranslateService: TranslateService;

	constructor() {
		super();
		this.API = new BoredApi();
		this.TranslateService = new TranslateService();

		this.makePublic('default', this.getRandom);
	}

	async getRandom(args: Args, requester: Message) {
		try {
			const randomActivity = await this.API.getRandom();
			const activityEmPT = await this.TranslateService.translate(
				randomActivity.activity,
				'en',
				'pt'
			);
			this.zaplify.replyAuthor(activityEmPT, requester);
		} catch (e) {
			console.warn(e);
			this.zaplify.replyAuthor('Erro' + e, requester);
		}
	}
}

export default Bored;
