import { create, Client, Message } from '@open-wa/wa-automate';
import options from 'src/config/startupConfig';
import parse from 'src/lib/T-Parser';
import ModulesWrapper from 'src/Modules';
import Zaplify from 'src/Modules/Zaplify';
import dotEnv from 'dotenv';
import DebugServer from './src/Debug';

const banned = ['556997479999@c.us', '551198783111@c.us', '557183543921@c.us'];

dotEnv.config({
	path: '.env',
});

const start = async (client: Client) => {
	console.log('[SERVER] Servidor iniciado!');
	const zaplify = new Zaplify(client);
	ModulesWrapper.Zaplify.registerZaplify(zaplify);

	const handleMsg = async (msg: string) => {
		const parsingResult = parse(msg?.toLowerCase() || 'null');

		if (!parsingResult.isError) {
			console.log(msg);
			const { command, method, args } = parsingResult.result;
			const module = ModulesWrapper.Zaplify.getModule(command);

			if (!module) return;

			module.setRequester();
			module.callMethod(method, args);
			const messageObject = zaplify.messageObject as Message;
			// client.reply(
			// 	messageObject.from,
			// 	[
			// 		'*FUTURO NUMERO NOVO!!!*',
			// 		'Logo o bot terá um numero novo. Por favor adicionem o bot neste link: https://wa.me/55119344556777',
			// 	].join('\n'),
			// 	messageObject.id
			// );
		}
	};

	client.onAnyMessage(message => {
		if (banned.includes(message.author) && message.body.startsWith('!')) {
			client.reply(message.from, 'Você está bloqueado :)', message.id);
			return;
		}
		if (
			!message.isGroupMsg &&
			(message?.caption?.startsWith('!') || message?.body?.startsWith('!'))
		) {
			return client.reply(
				message.from,
				'Esse bot só funciona em grupos',
				message.id
			);
		}
		zaplify.setMessageObject(message);
		handleMsg(message.caption || message.body);
	});

	client.onButton(async (chat: any) => {
		handleMsg(chat.selectedButtonId);
	});
};

DebugServer.listen(3000);

create({ ...options, multiDevice: true }).then(client => {
	start(client);
});
