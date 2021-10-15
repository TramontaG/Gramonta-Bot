import {
	Parser,
	ParserModifier,
	ParserModifierFactory,
	ParserState,
} from './models';
import { updateParserError, updateParserState } from './ParserUtils';

const maybeSome: ParserModifier =
	(parser: Parser, identifier?: string) =>
	(parserState: ParserState) => {
		if (parserState.isError) return parserState;
		let oldState = parserState;
		let results = [];

		while (true) {
			const newState = parser(oldState);
			if (newState.isError) break;
			results.push(newState.result);
			oldState = newState;
		}

		return updateParserState(oldState, {
			...oldState,
			result: results,
		});
	};

const atLeastOne: ParserModifier =
	(parser: Parser, identifier?: string) =>
	(parserState: ParserState) => {
		if (parserState.isError) return parserState;
		let oldState = parserState;
		let results = [];

		while (true) {
			const newState = parser(oldState);
			if (newState.isError) break;
			results.push(newState.result);
			oldState = newState;
		}

		if (results.length === 0)
			return updateParserError(
				parserState,
				`tried to capture at least one ${
					identifier || 'unidentified structure'
				} but got none`
			);

		return updateParserState(oldState, {
			...oldState,
			result: results,
		});
	};

const maybe: ParserModifier =
	(parser: Parser, identifier?: string) =>
	(parserState: ParserState) => {
		const tempState = parser(parserState);

		if (tempState.isError)
			return updateParserState(parserState, {
				...parserState,
				result: null,
			});

		return updateParserState(tempState, {
			...tempState,
			index: tempState.index,
			result: tempState.result,
		});
	};

const repeat: ParserModifierFactory =
	(amount: number) =>
	(parser: Parser, identifier?: string) =>
	(parserState: ParserState) => {
		if (parserState.isError) return parserState;
		let nextState = parserState;
		let results = [];

		for (let i = 0; i < amount; i++) {
			const tempState = parser(nextState);
			if (tempState.isError)
				return updateParserError(
					tempState,
					`Tried to capture ${amount} ${
						identifier || 'unidentified structure'
					} but found ${i}`
				);

			results.push(tempState.result);
			nextState = tempState;
		}
		return updateParserState(nextState, {
			...nextState,
			result: results,
		});
	};

const transform =
	(
		parser: Parser,
		transformerFn: (parserState: ParserState) => any
	) =>
	(parserState: ParserState) => {
		if (parserState.isError) return parserState;
		const newParserState = parser(parserState);
		if (newParserState.isError) return newParserState;

		return updateParserState(newParserState, {
			...newParserState,
			result: transformerFn(newParserState),
		});
	};

export default {
	maybeSome,
	maybe,
	atLeastOne,
	repeat,
	transform,
};
