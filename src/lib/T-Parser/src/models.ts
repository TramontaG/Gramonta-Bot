export type ParserState = {
	index: number;
	result: any;
	isError: boolean;
	error: string;
	stringToBeParsed: string;
	errorStack: string[];
	stringLeft: string;
};

export type Parser = (parserState: ParserState, supressErrors?: boolean) => ParserState;

export type ParserMaker = (target: any, identifier?: string) => Parser;

export type ParserCombinator = (parsers: Parser[], identifier?: string) => Parser;

export type ParserModifier = (parser: Parser, identifier?: string) => Parser;

export type ParserModifierFactory = (target: any) => ParserModifier;
