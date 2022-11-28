import parseDocument from './MdZapParser';
import { stroke, monospace, bold, italic } from './TextFormatter';

export type TemplateData = {
	[key: string]: unknown;
};

export type Message = {
	messageName: string;
	messageBody: Line[];
};

export type Line = {
	line: Text[];
};

export type Text = {
	style: keyof typeof styleMap;
	text: string;
};

const styleMap = {
	bold: bold,
	stroke: stroke,
	italic: italic,
	code: monospace,
	boldAndItalic: (s: string) => bold(italic(s)),
	normal: (s: string) => s,
	template: (s: string) => s,
	paragraph: (s: string) => `${bold(s)}\n`,
	listItem: (s: string) => `  - ${s}`,
	lineBreak: (s: string) => '',
};

export const getMessage = (
	messageName: string,
	documentAsString: string,
	templateData: TemplateData = {}
) => {
	const { result, isError, errorStack } = parseDocument(
		documentAsString,
		templateData
	);

	if (isError) {
		throw errorStack;
	}

	const myMessage = (result as Message[]).filter(
		msg => msg.messageName === messageName
	)[0];

	if (!myMessage) {
		throw 'No message found for the provided name';
	}

	return myMessage.messageBody.reduce((msg, { line }) => {
		line.forEach(styledText => {
			const stylingFn = styleMap[styledText.style];
			return (msg += stylingFn(styledText.text));
		});
		return (msg += '\n');
	}, '');
};
