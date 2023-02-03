import { Client, Message, MessageTypes } from '@open-wa/wa-automate';
import MockedClient from 'src/Debug/ZaplifyMock';
import ZaplifyMock from 'src/Debug/ZaplifyMock';
import { MockedMessageObject } from 'src/Debug/ZaplifyMock/Models';
import Zaplify from './Zaplify';
import fs from 'fs/promises';
import * as helpers from 'src/Helpers/messageGetter';

export interface Args {
	command: string;
	method: string;
	fullString: string;
	immediate?: string;
}

type PublicMethod = {
	name: string;
	method: (args: Args, requester: Message) => any;
};
type ModuleAddresser = {
	name: string;
	module: Module;
};

export class Module {
	publicMethods: PublicMethod[];
	zaplify!: Zaplify;
	requester!: Message;
	protected messagesPath: string;

	constructor() {
		this.publicMethods = [];
		this.messagesPath = '';
	}

	private getMessages(messagesPath: string) {
		return fs.readFile(messagesPath, { encoding: 'utf-8' }).then(messages => {
			return messages;
		});
	}

	getMessage(messageName: string, templateData?: helpers.TemplateData) {
		return this.getMessages(this.messagesPath).then(messages =>
			helpers.getMessage(messageName, messages, templateData)
		);
	}

	sendMessageFromTemplate(
		messageName: string,
		requester: Message,
		templateData?: helpers.TemplateData
	) {
		return this.getMessage(messageName, templateData)
			.then(msg => this.zaplify.replyAuthor(msg, requester))
			.catch(err => console.warn(err));
	}

	callMethod(methodName: string, args: Args, requester: Message): Promise<any> {
		const choosenMethod = this.publicMethods.filter(
			method => method.name === methodName
		)[0];
		if (!choosenMethod) {
			if (methodName !== 'default') {
				return this.callMethod('default', args, requester);
			}
		}
		return choosenMethod.method(args, requester);
	}

	makePublic<T extends Args>(name: string, method: (args: T, req: Message) => any) {
		this.registerPublicMethod({
			name,
			method: (args, req) => method.bind(this)(args as T, req),
		});
	}

	registerPublicMethod(method: PublicMethod) {
		this.publicMethods.push(method);
	}

	removePublicMethod(methodName: string) {
		this.publicMethods = this.publicMethods.filter(m => m.name !== methodName);
	}

	setRequester() {
		const message = this.zaplify?.messageObject;
		if (message?.type && message?.type !== MessageTypes.BUTTONS_RESPONSE) {
			this.requester = message;
		}
	}
}

class ModulesWrapper {
	modules: ModuleAddresser[];

	constructor() {
		this.modules = [];
	}

	registerModule(moduleName: string, module: Module) {
		this.modules.push({
			name: moduleName,
			module,
		});
	}

	getModule(moduleName: string) {
		const moduleAddress = this.modules.filter(module => module.name === moduleName);
		return moduleAddress[0]?.module;
	}

	registerZaplify(zaplify: Zaplify) {
		this.modules.forEach(module => {
			module.module.zaplify = zaplify;
		});
	}
}

export default ModulesWrapper;
