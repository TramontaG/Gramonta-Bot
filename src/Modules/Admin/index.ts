import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import { getMessage } from 'src/Helpers/messageGetter';

class Admin extends Module {
	myAdminGroups!: string[];
	messages!: string;

	constructor() {
		super();

		//[TODO] this is going inside the Module class eventualy
		fs.readFile('./src/Modules/Admin/messages.zap.md', { encoding: 'utf-8' }).then(
			messages => {
				this.messages = messages;
			}
		);

		this.makePublic('ban', this.ban);
	}

	private async validatePermissions(requester: Message) {
		const iAmAdm = await this.zaplify?.iAmAdmin(requester);
		if (!iAmAdm) throw getMessage('iAmNotAdmin', this.messages);

		const requesterIsAdm = await this.zaplify?.isAdmin(requester);
		if (!requesterIsAdm) throw getMessage('youAreNotAdmin', this.messages);
	}

	async ban(args: Args, requester: Message) {
		try {
			await this.validatePermissions(requester);
			const mentionedPeople = await this.zaplify.getMentionedPeople(requester);

			if (!mentionedPeople || mentionedPeople.length < 1) {
				throw getMessage('needToMentionSomeone', this.messages);
			}

			await this.zaplify.replyAuthor(
				getMessage('banning', this.messages),
				requester
			);
			mentionedPeople.forEach(id => {
				this.zaplify.banFromGroup(requester, id);
			});
		} catch (e) {
			console.warn(e);
			this.zaplify?.replyAuthor(`${e}`, requester);
		}
	}
}

export default Admin;
