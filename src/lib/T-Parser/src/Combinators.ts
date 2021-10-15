import { Parser, ParserCombinator, ParserModifier, ParserState } from './models';
import { updateParserError, updateParserState } from './ParserUtils';

const fullString: ParserModifier =
	(parser: Parser, identifier?: string) => (parserState: ParserState) => {
		if (parserState.isError) return parserState;
		const nextParserState = parser(parserState);

		if (nextParserState.isError) return nextParserState;

		if (nextParserState.index < nextParserState.stringToBeParsed.length)
			return updateParserError(nextParserState, `There is still unmatched contents`);

		return updateParserState(nextParserState, {
			...nextParserState,
			index: nextParserState.index,
			result: nextParserState.result,
		});
	};

const sequenceOf: ParserCombinator =
	(parsers: Parser[], identifier?: string) => (parserState: ParserState) => {
		if (parserState.isError) return parserState;
		let results: any[] = [];
		let oldState = parserState;

		for (let parser of parsers) {
			const newState = parser(oldState);
			if (newState.isError)
				return updateParserError(
					newState,
					`Error while trying to parse ${identifier || 'unindentified data structure'}`
				);
			results.push(newState.result);
			oldState = newState;
		}

		return updateParserState(oldState, {
			...oldState,
			result: results,
		});
	};

const choice: ParserCombinator =
	(parsers: Parser[], identifier?: string) => (parserState: ParserState) => {
		if (parserState.isError) return parserState;

		let nextState = parserState;
		let result;

		for (let parser of parsers) {
			const tempState = parser(nextState, true);
			if (!tempState.isError) {
				result = tempState.result;
				nextState = tempState;
				break;
			}
		}

		if (!result)
			return updateParserError(
				nextState,
				`No valid ${identifier || 'unidentified structure'} was found`
			);

		return updateParserState(nextState, {
			...nextState,
			result: result,
		});
	};

const parse = (string: string, parser: Parser, identifier?: string) => {
	const parserState = {
		index: 0,
		result: null,
		isError: false,
		error: '',
		stringToBeParsed: string,
		errorStack: [],
		stringLeft: '',
	};

	const fullParser = fullString(parser, identifier);

	return fullParser(parserState);
};

export default {
	fullString,
	sequenceOf,
	choice,
	parse,
};
