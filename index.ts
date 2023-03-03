import dotEnv from 'dotenv';

dotEnv.config({
	path: '.env',
});

import { create, Client, Message } from '@open-wa/wa-automate';
import options from 'src/config/startupConfig';
import parse from 'src/lib/T-Parser';
import ModulesWrapper from 'src/Modules';
import Zaplify from 'src/Modules/Zaplify';
import { filterProperty } from 'src/Helpers/ObjectManipulation';
import fs from 'fs/promises';

const start = async (client: Client) => {
	console.log('[SERVER] Servidor iniciado!');
	const zaplify = new Zaplify(client);
	ModulesWrapper.Zaplify.registerZaplify(zaplify);

	const handleMsg = async (msg: string, messageObject: Message) => {
		const parsingResult = parse(msg || 'null');

		if (!parsingResult.isError) {
			const { command, method } = parsingResult.result;
			const module = ModulesWrapper.Zaplify.getModule(command);
			const messageData = filterProperty(parsingResult.result, 'args');

			if (!module) return;

			const { banned } = JSON.parse(await fs.readFile('./banned.json', 'utf-8')) as {
				banned: string[];
			};

			if (banned.some(ban => messageObject.author.includes(ban))) {
				client.reply(messageObject.from, 'Você está bloqueado :)', messageObject.id);
				return;
			}

			module.setRequester();
			try {
				client.react(messageObject.id, '👌');
				module.callMethod(
					method,
					{
						...messageData,
						...parsingResult.result.args,
					},
					messageObject
				);
			} catch (e) {
				console.warn(e);
			}
		}
	};

	client.onAnyMessage(message => {
		try {
			zaplify.setMessageObject(message);
			handleMsg(message.caption || message.body, message).catch(e =>
				console.warn(e)
			);
		} catch (e) {
			console.warn(e);
		}
	});

	client.onButton(message => {
		const buttons = message.quotedMsg!.buttons!;
		const option = buttons.find(btn => btn.text === message.body)!;
		handleMsg(option.id, message);
	});

	/**
	 * That's too buggy in order to be used yet. My code works, but the events
	 * doesn't seem to trigger properly. Too bad :(
	 */
	// client.onReaction(ev => {
	// 	const { message, reactions, type, reactionByMe } = ev;

	// 	const payload = decodePayloadFromMessage(message.caption || message.body);
	// 	const emoji: Emoji = reactions[0].id;

	// 	if (!payload) {
	// 		return;
	// 	}

	// 	const { isError, result } = parse(payload[emoji] || 'null');

	// 	if (isError) {
	// 		return;
	// 	}

	// 	const { command } = result;

	// 	const module = ModulesWrapper.Zaplify.getModule(command);

	// 	if (!module) return;

	// 	module.setRequester();

	// 	const messageData = filterProperty(result, 'args');
	// 	return module.callReactionCB(emoji, message, {
	// 		...messageData,
	// 		...result.args,
	// 	});
	// });
};

create({ ...options(), multiDevice: true }).then(client => {
	start(client);
});
