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
		if (!iAmAdm) throw getMessage('i-am-not-admin', this.messages);

		const requesterIsAdm = await this.zaplify?.isAdmin(requester);
		if (!requesterIsAdm) throw getMessage('you-are-not-admin', this.messages);
	}

	async ban(args: Args, requester: Message) {
		console.log('RAN FUNCTION');
		try {
			await this.validatePermissions(requester);
			console.log('validations passed');
			const mentionedPeople = await this.zaplify.getMentionedPeople(requester);

			console.log({ mentionedPeople });
			if (!mentionedPeople || mentionedPeople.length < 1) {
				throw getMessage('need-to-mention-someone', this.messages);
			}

			this.zaplify.replyAuthor(getMessage('banning', this.messages), requester);
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
