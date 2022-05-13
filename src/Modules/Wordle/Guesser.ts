import { normalizeLetter, normalizeString } from 'src/Helpers/TextFormatter';
import wordList from '../../../media/Dictionaries/wordlist';

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

class Guesser {
	tries: number;
	history: LetterStatus[][];
	instance?: Guesser;
	id: number;
	word: WordInstance;
	won: boolean;

	constructor(id: number) {
		this.id = id;
		this.tries = 0;
		this.word = createWordInstance(this.getWord(id));
		this.history = [];
		this.won = false;
	}

	static guessersGroup: GuessersGroup = {};

	static getInstance(phone: number) {
		//that's a factory and singleton in the same function
		//kinda ugly but whatever, it's functional
		const now = new Date();
		const today = now.getMonth() * 31 + now.getDate();
		const id = phone + today;
		const guesser = new Guesser(id);
		const word = guesser.word.stringRepresentation;

		console.log({ word });

		if (!this.guessersGroup[id]) this.guessersGroup[id] = { word, guesser };

		return this.guessersGroup[id];
	}

	getWord(id: number) {
		const randomness = Math.round(Math.random() * 2000);
		const index = (id + randomness) % (wordList.length - 1);
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
		return result;
	}
}

export default Guesser;
