import { create, Client, Message } from '@open-wa/wa-automate';
import options from 'src/config/startupConfig';
import parse from 'src/lib/T-Parser';
import ModulesWrapper from 'src/Modules';
import Zaplify from 'src/Modules/Zaplify';
import dotEnv from 'dotenv';

dotEnv.config({
	path: '.env',
});

const start = async (client: Client) => {
	console.log('[SERVER] Servidor iniciado!');
	const zaplify = new Zaplify(client);
	ModulesWrapper.registerZaplify(zaplify);

	const handleMsg = async (msg: string) => {
		const parsingResult = parse(msg?.toLowerCase() || 'null');

		if (!parsingResult.isError) {
			const { command, method, args } = parsingResult.result;
			const module = ModulesWrapper.getModule(command);

			if (!module) return;

			module.setRequester();
			module.callMethod(method, args);
		}
	};

	client.onMessage(message => {
		zaplify.setMessageObject(message);
		handleMsg(message.caption || message.body);
	});

	client.onButton(async (chat: any) => {
		handleMsg(chat.selectedButtonId);
	});
};

create({ ...options, multiDevice: true }).then(client => {
	start(client);
});
