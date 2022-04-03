import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';

type TransformerFn = (src: string) => string;

class TextTransform extends Module {
	transformerFn: TransformerFn;

	constructor(transformerFn: TransformerFn) {
		super();

		this.transformerFn = transformerFn;

		this.registerPublicMethod({
			name: 'default',
			method: this.trasnsform.bind(this),
		});
	}

	trasnsform(_: Args) {
		const requester = this.zaplify?.messageObject as Message;
		const string = requester.quotedMsg?.body;

		if (!string)
			return this.zaplify?.replyAuthor(
				'Responda uma mensagem para eu modificar o texto',
				requester
			);

		return this.zaplify?.replyAuthor(this.transformerFn(string), requester);
	}
}

export default TextTransform;
