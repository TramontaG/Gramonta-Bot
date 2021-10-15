import { Parser, ParserState } from './models';

const updateParserError = (previousState: ParserState, errorMsg: string): ParserState => {
	previousState.errorStack.unshift(errorMsg);
	const stringLeft = previousState.stringToBeParsed.slice(previousState.index);
	return {
		...previousState,
		isError: true,
		stringLeft,
	};
};

const updateSupressedParserError = (previousState: ParserState, errorMsg: string): ParserState => {
	return {
		...previousState,
		isError: true,
		stringLeft: previousState.stringToBeParsed.slice(previousState.index),
	};
};

const updateParserState = (previousState: ParserState, newState: ParserState) => {
	return {
		...previousState,
		...newState,
		errorStack: [],
	};
};

export { updateParserError, updateSupressedParserError, updateParserState };
