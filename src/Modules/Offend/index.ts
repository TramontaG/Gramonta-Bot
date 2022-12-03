import { Message } from '@open-wa/wa-automate';
import { getMessage } from 'src/Helpers/messageGetter';
import { randomItem } from 'src/Helpers/ObjectManipulation';
import { Args, Module } from '../ModulesRegister';
import OffenseAPI from './API';

class Offend extends Module {
	OffenseApi: OffenseAPI;
	messages!: string;

	constructor() {
		super();
		this.OffenseApi = new OffenseAPI();
		this.messagesPath = './src/Modules/Offend/messages.zap.md';

		this.makePublic('default', this.offend);
	}

	async offend(args: Args, requester: Message) {
		try {
			const offense = await this.OffenseApi.getRandomOffense();
			if (!offense) throw this.getMessage('noOffense');

			const tagged = (await this.zaplify.getMentionedPeople(requester))?.[0];
			if (!tagged) {
				const message = await this.getMessage('tagSomeone', {
					offense: offense.xingamento,
				});
				throw message;
			}

			const taggedPerson = await this.zaplify.getContactInfoFromContactId(tagged);
			const response = await this.getMessage(this.getRandomOffenseMessage(), {
				offense: offense.xingamento,
				contact: `${taggedPerson.pushname || taggedPerson.shortName}`,
			});

			return this.zaplify.replyAuthor(response, requester);
		} catch (e) {
			this.zaplify.replyAuthor(`Erro: ${e}`, requester);
		}
	}

	private getRandomOffenseMessage() {
		const offenseMessageNames = ['curse1', 'curse2', 'curse3'];
		return randomItem(offenseMessageNames);
	}
}

export default Offend;
