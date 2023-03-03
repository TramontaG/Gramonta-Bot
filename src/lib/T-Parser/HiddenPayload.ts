import { Emoji } from 'src/Modules/ModulesRegister';
import T from './src/AtomicParsers';
import C from './src/Combinators';
import M from './src/Modifiers';

export const zero = '⁫';
export const one = '‎';
export const separator = '﻿';

export type EmojiPayload = {
	[key in Emoji]: string;
};

export const hidePayload = (text: string) =>
	text
		.split('')
		.map(char => char.charCodeAt(0))
		.map(unicode => unicode.toString(2))
		.join(separator)
		.replace(/0/g, zero)
		.replace(/1/g, one);

export const decodePayload = (text: string) =>
	text
		.replace(new RegExp(zero, 'g'), '0')
		.replace(new RegExp(one, 'g'), '1')
		.split(separator)
		.map(unicode => String.fromCharCode(parseInt(unicode, 2)))
		.join('');

const anythingBeforePayload = T.regexMatch(
	new RegExp(`^[^${zero}${one}${separator}]*`, 'g'),
	'anything'
);

const payload = T.regexMatch(`^[${zero}${one}${separator}]+`, 'Payload');

const messageWithPayload = M.transform(
	C.sequenceOf([anythingBeforePayload, M.maybe(payload)], 'Message'),
	({ result }) => (result[1] ? decodePayload(result[1]) : undefined)
);

export const decodePayloadFromMessage = (messageBody: string) => {
	const { error, result } = C.parse(messageBody, messageWithPayload);
	if (error) return undefined;
	return JSON.parse(result) as EmojiPayload;
};
