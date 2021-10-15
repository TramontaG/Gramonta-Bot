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

	console.log(process.env.CLIENT_KEY);

	const handleMsg = async (msg: string) => {
		const parsingResult = parse(msg?.toLowerCase());

		if (!parsingResult.isError) {
			const { command, method, args } = parsingResult.result;
			ModulesWrapper.getModule(command)?.callMethod(
				method || 'default',
				args
			);
		}

		if (parsingResult.result && parsingResult.isError) {
			console.log(parsingResult.errorStack);
		}
	};

	client.onMessage(message => {
		zaplify.setMessageObject(message);
		handleMsg(message.caption || message.body);
	});

	client.onButton(async (chat: any) => {
		zaplify.setMessageObject(chat);
		handleMsg(chat.selectedButtonId);
	});
};

create(options).then(client => {
	start(client);
});
