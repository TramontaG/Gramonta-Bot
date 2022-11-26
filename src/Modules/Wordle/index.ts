import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import Guesser from './Guesser';
import * as messages from './messages';

type WordleArgs = Args & {};

class Wordle extends Module {
	constructor() {
		super();

		this.registerPublicMethod({
			name: 'guess',
			method: this.guess.bind(this),
		});

		this.registerPublicMethod({
			name: 'help',
			method: this.help.bind(this),
		});

		this.registerPublicMethod({
			name: 'default',
			method: this.default.bind(this),
		});
	}

	guess(args: WordleArgs) {
		const requester = this.zaplify?.messageObject as Message;
		const guesser = Guesser.getInstance(requester);
		const guess = args.immediate?.trim() as string;

		try {
			this.validateGuess(guess);
			guesser.guesser.guess(guess); //Aight this is ridiculous
			this.zaplify?.replyAuthor(messages.GUESS_STATUS(guesser.guesser), requester);
		} catch (e) {
			this.zaplify?.replyAuthor(messages.ERROR(e), requester);
		}
	}

	help(_: Args, requester: Message) {
		this.zaplify?.replyAuthor(messages.HELP(), requester);
	}

	default(_: Args, requester: Message) {
		this.zaplify?.replyAuthor(messages.WORDLE_DEFAULT(), requester);
	}

	private validateGuess(guess?: string) {
		if (!guess) throw messages.ERROR('Chute não encontrado');
		if (guess.length !== 5)
			throw messages.ERROR('Apenas chutes de 5 letras são pertmitidos');
		if (guess.match(/[^A-zÀ-ÿ]/))
			throw messages.ERROR('Apenas letras são permitidas!');
	}
}

export default Wordle;
