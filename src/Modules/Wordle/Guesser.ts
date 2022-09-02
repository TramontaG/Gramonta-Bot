import { Message } from '@open-wa/wa-automate';
import { WordleState } from 'src/BigData/JsonDB';
import { normalizeLetter, normalizeString } from 'src/Helpers/TextFormatter';
import wordList from '../../../media/Dictionaries/wordlist';

import Logger from '../Logger';

type GuessersGroup = {
	[key: number]: {
		guesser: Guesser;
		word: string;
	};
};

type WordInstance = {
	hasLetter: (letter: string) => boolean;
	hasLetterInIndex: (letter: string, index: number) => boolean;
	stringRepresentation: string;
};

const createWordInstance = (word: string): WordInstance => {
	return {
		stringRepresentation: word,
		hasLetter: (letter: string) => normalizeString(word).includes(letter),
		hasLetterInIndex: (letter: string, index: number) =>
			normalizeString(word)[index] === letter,
	};
};

export enum LetterStatus {
	LetterInIndex,
	LetterInWord,
	LetterNotFound,
}

type LoggerMap = {
	[key in WordleState]: any;
} & {
	try: any;
};

class Guesser {
	tries: number;
	history: LetterStatus[][];
	instance?: Guesser;
	id: string;
	word: WordInstance;
	won: boolean;

	requester: Message;

	logger: Logger;

	constructor(id: string, requester: Message) {
		this.id = id;
		this.tries = 0;
		this.word = createWordInstance(this.getWord(id));
		this.history = [];
		this.won = false;

		this.logger = new Logger();
		this.requester = requester;
	}

	static guessersGroup: GuessersGroup = {};

	static getInstance(requester: Message) {
		//that's a factory and singleton in the same function
		//kinda ugly but whatever, it's functional
		const now = new Date();
		const today = now.getMonth() * 31 + now.getDate();
		const id = requester.author + today;
		const guesser = new Guesser(id, requester);
		const word = guesser.word.stringRepresentation;

		const sanitizeId = Number(id.replace(/[^0-9]+/g, ''));

		if (!this.guessersGroup[sanitizeId]) {
			this.guessersGroup[sanitizeId] = { word, guesser };
			guesser.log('start', guesser, requester);
		}

		return this.guessersGroup[sanitizeId];
	}

	getWord(id: string) {
		const sanitizedId = Number(id.replace(/[^0-9]+/g, ''));
		const randomness = Math.round(Math.random() * 2000);
		const index = (sanitizedId + randomness) % (wordList.length - 1);
		return wordList[index];
	}

	guess(guess: string) {
		const normalizedGuess = normalizeString(guess);
		if (this.won)
			throw 'Você já adivinhou essa palavra. Volte amanhã para jogar mais';

		if (this.tries === 6) throw 'Chances encerradas';

		if (!wordList.includes(guess) && !wordList.includes(normalizedGuess))
			throw 'Você só pode usar palavras como palpite.';

		const result = normalizedGuess.split('').map((letter, index) => {
			if (this.word.hasLetterInIndex(letter, index))
				return LetterStatus.LetterInIndex;
			if (this.word.hasLetter(letter)) return LetterStatus.LetterInWord;
			return LetterStatus.LetterNotFound;
		});

		this.won =
			result.filter(letter => letter === LetterStatus.LetterInIndex).length ===
			this.word.stringRepresentation.length;

		this.history.push(result);
		this.tries++;

		if (this.won) this.log('win');
		else {
			if (this.tries === 0) this.log('lose');
			else this.log('try');
		}

		return result;
	}

	log(
		state: WordleState | 'try',
		instance: Guesser = this,
		requester: Message = this.requester
	) {
		const getGame = async () =>
			(
				await this.logger.logger.getEntities(
					'wordle',
					game => game.gameID === instance.id
				)
			)[0];

		const logStart = () => {
			return this.logger.logger.insertNew('wordle', {
				groupName: requester.chat.name,
				chatId: requester.chat.id,
				date: new Date().getTime(),
				requester: requester.sender.formattedName,
				state: 'start',
				tries: 1,
				gameID: instance.id,
			});
		};

		const logTry = async () => {
			const game = await getGame();
			this.logger.logger.updateObject('wordle', game.id, {
				...game,
				tries: game.tries + 1,
			});
		};

		const logWin = async () => {
			const game = await getGame();
			this.logger.logger.updateObject('wordle', game.id, {
				...game,
				state: 'win',
			});
		};

		const logLose = async () => {
			const game = await getGame();
			this.logger.logger.updateObject('wordle', game.id, {
				...game,
				state: 'lose',
			});
		};

		const loggerMap: LoggerMap = {
			start: logStart,
			try: logTry,
			win: logWin,
			lose: logLose,
		};

		try {
			// loggerMap[state]();
		} catch (e) {
			console.warn(e);
		}
	}
}

export default Guesser;
