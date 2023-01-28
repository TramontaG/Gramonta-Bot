import dotEnv from 'dotenv';
import { create, Client, Message } from '@open-wa/wa-automate';
import options from 'src/config/startupConfig';
import parse from 'src/lib/T-Parser';
import ModulesWrapper from 'src/Modules';
import Zaplify from 'src/Modules/Zaplify';
import { filterProperty } from 'src/Helpers/ObjectManipulation';

const banned = [
	'556997479999@c.us',
	'551198783111@c.us',
	'557183543921@c.us',
	'5521969693229@c.us',
	'447796457170c.us',
	'554598345338@c.us',
	'5521991967597@c.us',
	'555196222255@c.us',
	'558881803667@c.us',
	'553398082321@c.us',
	'554891418193@c.us',
	'556993749999@c.us',
	'5519987510627@c.s',
	'556993018716@c.us',
	'558594062647@c.us',
	'5514988079818@c.us',
	'5521992529593@c.us',
];

dotEnv.config({
	path: '.env',
});

const start = async (client: Client) => {
	console.log('[SERVER] Servidor iniciado!');
	const zaplify = new Zaplify(client);
	ModulesWrapper.Zaplify.registerZaplify(zaplify);

	const handleMsg = async (msg: string, messageObject: Message) => {
		const parsingResult = parse(msg.toLowerCase() || 'null');

		if (!parsingResult.isError) {
			const { command, method } = parsingResult.result;
			const module = ModulesWrapper.Zaplify.getModule(command);
			const messageData = filterProperty(parsingResult.result, 'args');

			if (!module) return;

			module.setRequester();
			try {
				module.callMethod(
					method,
					{
						...messageData,
						...parsingResult.result.args,
					},
					messageObject
				);
				client.react(messageObject.id, '👌');
			} catch (e) {
				console.warn(e);
			}
		}
	};

	client.onAnyMessage(message => {
		try {
			// if (message.body.startsWith('!') && !message.fromMe) {
			// 	client.reply(
			// 		message.from,
			// 		'Bot em manutenção. Agradeço a compreensão :)',
			// 		message.id
			// 	);
			// 	return;
			// }

			if (banned.includes(message.author) && message.body.startsWith('!')) {
				client.reply(message.from, 'Você está bloqueado :)', message.id);
				return;
			}
			// if (
			// 	!message.isGroupMsg &&
			// 	(message?.caption?.startsWith('!') || message?.body?.startsWith('!'))'
			// ) {
			// 	return client.reply(
			// 		message.from,
			// 		'Esse bot só funciona em grupos',
			// 		message.id
			// 	);
			// }
			zaplify.setMessageObject(message);
			handleMsg(message.caption || message.body, message).catch(e =>
				console.warn(e)
			);
		} catch (e) {
			console.warn(e);
		}
	});
};

create({ ...options(), multiDevice: true }).then(client => {
	start(client);
});
