import { Message, MessageId } from '@open-wa/wa-automate';
import Express from 'express';
import parse from 'src/lib/T-Parser';
import modules from 'src/Modules';
import MockedClient from './ZaplifyMock';
import { MockedMessageObject } from './ZaplifyMock/Models';

const DebugServer = Express();
DebugServer.use(Express.json());
DebugServer.use(Express.urlencoded({ extended: false }));

DebugServer.get('/', async (req, res) => {
	const queryParamsCommand = req.query.command as string;
	const parseResult = parse(queryParamsCommand);

	if (parseResult.isError) return res.status(400).send('Invalid command');

	const mockedCient = MockedClient.getInstance(req, res);
	const sender = mockedCient.messageObject?.sender as Message['sender'];
	mockedCient.messageObject = {
		id: `Debug - Message sent through WebRequest on ${new Date()}` as MessageId,
		author: 'Postman',
		sender: {
			...sender,
			formattedName: '+5511@974952409',
		},
	};

	modules.WebRequest.registerMockedZaplify(mockedCient);

	const { command, method, args } = parseResult.result;
	const module = modules.WebRequest.getModule(command);
	if (!module) return;

	module.setRequester();
	await module.callMethod(method, args);

	mockedCient.sendReplyQueue();
});

export default DebugServer;
