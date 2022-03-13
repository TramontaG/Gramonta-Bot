import Express from 'express';
import parse from 'src/lib/T-Parser';
import modules from 'src/Modules';
import MockedClient from './ZaplifyMock';

const DebugServer = Express();
DebugServer.use(Express.json());

DebugServer.get('/', async (req, res) => {
	const parseResult = parse(req.body.command);
	if (parseResult.isError) return res.status(400).send('Invalid command');

	const mockedCient = MockedClient.getInstance(req, res);
	mockedCient.messageObject = {
		id: `Debug - Message sent through WebRequest on ${new Date()}`,
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
