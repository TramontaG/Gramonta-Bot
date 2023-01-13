import { ContactId, Message } from '@open-wa/wa-automate';
import Logger from '../Logger/Logger';
import { Args, Module } from '../ModulesRegister';

type BanArgs = {
	reason?: string;
	time?: string;
} & Args;

class Ban extends Module {
	logger: Logger;

	constructor() {
		super();
		this.makePublic('default', this.banFromBot);

		this.messagesPath = './src/Modules/Ban/messages.zap.md';
		this.logger = new Logger();
	}

	public async banFromBot(args: BanArgs, requester: Message) {
		if (!requester.id.includes('5511947952409')) {
			const msg = await this.getMessage('onlyOwner');
			return this.zaplify.replyAuthor(msg, requester);
		}

		const tagged = await this.zaplify.getMentionedPeople(requester);
		await this.insertBan(tagged, args);

		const msg = await this.getMessage('success');
		return this.zaplify.replyAuthor(msg, requester);
	}

	public async unban(args: BanArgs, requester: Message) {
		if (!requester.id.includes('5511947952409')) {
			const msg = await this.getMessage('onlyOwner');
			return this.zaplify.replyAuthor(msg, requester);
		}

		const tagged = await this.zaplify.getMentionedPeople(requester);
		await this.removeBan(tagged, args);

		const msg = await this.getMessage('successUnban');
		return this.zaplify.replyAuthor(msg, requester);
	}

	private async insertBan(tagged: ContactId[], args: BanArgs) {
		for await (const contact of tagged) {
			await this.logger.upsert('bannedUsers', {
				id: contact,
				banDate: new Date().getTime(),
				banTime: this.getBanTime(args.time),
				reason: args.reason || '',
			});
		}
	}

	private async removeBan(tagged: ContactId[], args: BanArgs) {
		for await (const contact of tagged) {
			await this.logger.deleteEntity('bannedUsers', contact);
		}
	}

	private getBanTime(timeString?: string) {
		if (!timeString) {
			return 1000 * 60 * 60 * 24 * 365 * 10; //ten years in ms;
		}
		const dayInMs = 1000 * 60 * 60 * 24;
		const unitAmount = Number(timeString.match(/\d+/)![0]);

		if (timeString.includes('d')) {
			return dayInMs * unitAmount;
		}

		if (timeString.includes('w')) {
			return dayInMs * 7 * unitAmount;
		}

		if (timeString.includes('m')) {
			return dayInMs * 30 * unitAmount;
		}

		if (timeString.includes('y')) {
			return dayInMs * 365 * unitAmount;
		}

		return 1000 * 60 * 60 * 24 * 365 * 10; //ten years in ms;
	}
}

export default Ban;
