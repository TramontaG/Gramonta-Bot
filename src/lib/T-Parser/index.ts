import T from './src/AtomicParsers';
import C from './src/Combinators';
import M from './src/Modifiers';

import util from 'util';
import url from './UrlParser';

const flatArgs = (args: any[]) => {
	return args.reduce((acc, obj) => {
		const key = Object.keys(obj)[0];
		const value = obj[key];
		return { ...acc, [key]: value };
	}, {});
};

const deepLog = (obj: any) => {
	console.log(
		util.inspect(obj, {
			colors: true,
			depth: null,
			showHidden: true,
		})
	);
};

const command = M.transform(
	C.sequenceOf([T.str('!'), T.letters]),
	({ result }) => result[1]
);

const method = M.transform(
	C.sequenceOf([T.whiteSpace, T.letters]),
	({ result }) => result[1]
);

const argName = M.transform(
	C.sequenceOf([M.maybe(T.whiteSpace), T.str('-'), T.letters]),
	({ result }) => result[2]
);

const argValue = M.transform(
	C.choice([url, T.regexMatch(/^[\w \s]+/)]),
	({ result }) => {
		console.log(result);
		return result;
	}
);

const immediateArg = M.transform(
	C.sequenceOf([argValue]),
	({ result }) => ({ immediate: result[0] })
);

const namedArg = M.transform(
	C.sequenceOf([argName, T.whiteSpace, argValue]),
	({ result }) => ({ [result[0]]: result[2] })
);

const arg = C.choice([namedArg, immediateArg]);

const parser = M.transform(
	C.sequenceOf(
		[command, M.maybe(method, 'method'), M.maybeSome(arg, 'arg')],
		'Command'
	),
	({ result }) => ({
		command: result[0],
		method: result[1],
		args: flatArgs(result[2]),
	})
);

const parse = (commandString: string) => {
	const parsingResult = C.parse(commandString || '', parser);
	return parsingResult;
};

export default parse;
