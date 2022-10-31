import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import DictAPI, {
	SentenceExample,
	Syllables,
	Synonyms,
	WordMeaning,
} from './DictAPI';

class Dictionary extends Module {
	dictApi: DictAPI;

	constructor() {
		super();
		this.dictApi = new DictAPI();

		this.registerPublicMethod({
			name: 'get',
			method: this.all.bind(this),
		});

		this.registerPublicMethod({
			name: 'de',
			method: this.all.bind(this),
		});
	}

	async all(args: Args) {
		const requester = this.requester as Message;
		try {
			const word = args.immediate?.trim().split(' ')[0];
			if (!word) throw 'Preciso de uma palavra';

			const syllables = this.dictApi.syllables(word);
			const meanings = this.dictApi.meaning(word);
			const synoyms = this.dictApi.synonyms(word);
			const sentenceExamples = this.dictApi.sentenceExample(word);

			return Promise.all([syllables, meanings, synoyms, sentenceExamples])
				.then(messages => {
					if (messages.includes(undefined)) {
						this.zaplify?.replyAuthor('Não conheço essa palavra', requester);
						return;
					}

					const fullMesage = [
						`${this.createSyllablesMessage(word, messages[0] as Syllables)}`,
						`${this.createMeaningMessage(word, messages[1] as WordMeaning[])}`,
						`${this.createSynonymsMessage(word, messages[2] as Synonyms)}`,
						`${this.createSentenceExampleMessage(
							word,
							messages[3] as SentenceExample[]
						)}`,
					].join('\n ________________________________ \n');

					this.zaplify?.replyAuthor(fullMesage, requester);
				})
				.catch(e => {
					throw e;
				});
		} catch (e) {
			this.zaplify?.replyAuthor(JSON.stringify(e), requester);
		}
	}

	createMeaningMessage(word: string, wordMeanings: WordMeaning[]) {
		return wordMeanings.reduce(
			(msg, meaning, index) =>
				(msg += [
					`*SIGNIFICADO DE ${word.toLocaleUpperCase()}*: ${index + 1}/${
						wordMeanings.length
					}`,
					``,
					`*Classe gramatical:* ${meaning.partOfSpeech}`,
					`*Etimologia: ${meaning.etymology}`,
					`Significados: ${this.createListString(meaning.meanings)}`,
				].join('\n')),
			''
		);
	}

	createSynonymsMessage(word: string, synonyms: Synonyms) {
		return [
			`*SINÔNIMOS DE ${word.toLocaleUpperCase()}:*`,
			`${this.createListString(synonyms)}`,
		].join('\n');
	}

	createSyllablesMessage(word: string, syllables: Syllables) {
		return [
			`*${word.toLocaleLowerCase()}:*`,
			`${this.createListString(syllables)}`,
		].join('\n');
	}

	createSentenceExampleMessage(word: string, sentenceExamples: SentenceExample[]) {
		return [
			`*EXEMPLOS EM FRASES:*`,
			`${this.createListString(
				sentenceExamples.map(example =>
					[
						`${example.sentence}`.replace(word, `*_${word}_*`),
						`Autor: ${example.author}`,
					].join('\n')
				)
			)}`,
		].join('\n');
	}

	createListString(strings: string[]) {
		return strings.map((item, index) => `    ${index + 1} - ${item}`).join('\n');
	}
}

export default Dictionary;
