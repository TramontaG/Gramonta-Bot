import * as T from '@guigalleta/t-parser';

const anything = T.regexMatch(/^.*/);

const exceptChars = (chars: string) => `^[^${chars}\n]+`;

type TemplateData = {
	[key: string]: unknown;
};

let injectableData: TemplateData = {};

const paragraph = T.transform(
	T.sequenceOf([T.str('#'), T.whiteSpace, anything], 'bold'),
	({ result }) => ({
		style: 'paragraph',
		text: result[2],
	})
);

const italic = T.transform(
	T.betweenStrings('_', '_')(T.regexMatch(exceptChars('_'))),
	({ result }) => ({
		style: 'italic',
		text: result,
	})
);

const stroke = T.transform(
	T.betweenStrings('~', '~')(T.regexMatch(exceptChars('~')), 'stroke'),
	({ result }) => ({
		style: 'stroke',
		text: result,
	})
);

const bold = T.transform(
	T.betweenStrings('**', '**')(T.regexMatch(exceptChars('*')), 'bold'),
	({ result }) => ({
		style: 'bold',
		text: result,
	})
);

const boldAndItalic = T.transform(
	T.betweenStrings('**_', '_**')(T.regexMatch(exceptChars('*_')), 'boldAndItalic'),
	({ result }) => ({
		style: 'boldAndItalic',
		text: result,
	})
);

const code = T.transform(
	T.betweenStrings('`', '`')(T.regexMatch(exceptChars('`')), 'code'),
	({ result }) => ({
		style: 'code',
		text: result,
	})
);

const template = T.transform(
	T.betweenStrings('{{', '}}')(T.regexMatch(exceptChars('{}')), 'code'),
	({ result }: { result: keyof TemplateData }) => ({
		style: 'template',
		text: `${injectableData[result]}`,
	})
);

const normalText = T.transform(
	T.regexMatch(exceptChars('`~_*{>'), 'Normal Text'),
	({ result }) => ({
		style: 'normal',
		text: result,
	})
);

const listItem = T.transform(
	T.sequenceOf([T.str('-'), T.whiteSpace, T.lettersOrDigits]),
	({ result }) => ({
		style: 'listItem',
		text: result[2],
	})
);

const textLine = T.transform(
	T.sequenceOf(
		[
			T.maybeSome(T.anySpace),
			T.atLeastOne(
				T.choice([
					paragraph,
					stroke,
					listItem,
					boldAndItalic,
					bold,
					italic,
					code,
					template,
					normalText,
				])
			),
			T.maybeSome(T.str('\n')),
		],
		'Line'
	),
	({ result }) => ({
		line: result[1],
	})
);

const messageDeclaration = T.transform(
	T.sequenceOf(
		[
			T.str('>'),
			T.whiteSpace,
			T.str('@'),
			T.lettersOrDigits,
			T.atLeastOne(T.str('\n')),
		],
		'message declaration'
	),
	({ result }) => result[3]
);

const messageEnd = T.sequenceOf(
	[
		T.str('>'),
		T.whiteSpace,
		T.str('---'),
		T.maybeSome(T.str('-')),
		T.maybeSome(T.str('\n')),
	],
	'Message end'
);

const message = T.transform(
	T.sequenceOf(
		[
			T.maybeSome(T.str('\n')),
			messageDeclaration,
			T.atLeastOne(textLine),
			messageEnd,
		],
		'Message'
	),
	({ result }) => ({
		messageName: result[1],
		messageBody: result[2],
	})
);

const document = T.atLeastOne(message, 'document');

const parseDocument = (documentInString: string, data: TemplateData) => {
	injectableData = data;
	return T.parse(documentInString, document);
};

export default parseDocument;
