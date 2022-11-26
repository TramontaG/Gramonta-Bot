import { Message } from '@open-wa/wa-automate';
import { randomItem } from 'src/Helpers/ObjectManipulation';
import { Args, Module } from '../ModulesRegister';
import MensagensAPI from './BomDiaApi';

type MensagensArgs = {
	page?: string;
} & Args;

class MensagensModule extends Module {
	mensagensAPI: MensagensAPI;

	constructor() {
		super();
		this.mensagensAPI = new MensagensAPI();

		this.makePublic('bomdia', this.bomDia);
		this.makePublic('default', () => {});
	}

	async bomDia(args: MensagensArgs, requester: Message) {
		try {
			if (args.immediate === 'image' || args.immediate === 'imagem') {
				const bomDiaImages = await this.allBomDiaImages();
				const randomImage = randomItem(bomDiaImages);
				console.log('GOT DATA', { randomImage });
				return this.zaplify?.sendImageFromUrl(
					randomImage.src,
					randomImage.alt,
					requester
				);
			}
			if (args.immediate === 'text' || args.immediate === 'texto') {
				const bomDiaTexts = await this.allBomDiaTexts();
				const randomText = randomItem(bomDiaTexts);
				console.log('GOT DATA', { randomText });
				return this.zaplify?.replyAuthor(randomText, requester);
			}

			return this.zaplify?.replyAuthor(
				'Bom dia! Escolha imagem ou texto que eu mando pra você!',
				requester
			);
		} catch (e) {
			this.zaplify?.replyAuthor(`Erro: ${e}`, requester);
		}
	}

	private allBomDiaTexts(page?: number) {
		return Promise.all([
			this.mensagensAPI.mundoDasMensagens('/mensagens-bom-dia', page),
			this.mensagensAPI.mensagensComAmor('/mensagens-bom-dia', page),
		]).then(([mundoDasMensagens, mensagensComAmor]) => [
			...mundoDasMensagens.data.texts.map(text =>
				this.signText(
					text,
					'Mundo Das Mensagens',
					'https://www.mundodasmensagens.com'
				)
			),
			...mensagensComAmor.data.texts.map(text =>
				this.signText(text, 'Mensagens Com Amor', 'https://www.mensagenscomamor.com')
			),
		]);
	}

	private allBomDiaImages(page?: number) {
		return Promise.all([
			this.mensagensAPI.mundoDasMensagens('/mensagens-bom-dia', page),
			this.mensagensAPI.mensagensComAmor('/mensagens-bom-dia', page),
			this.mensagensAPI.belasMensagens('/bom-dia', page),
		]).then(([mundoDasMensagens, mensagensComAmor, belasMensagens]) => [
			...mundoDasMensagens.data.images
				.filter(img => img.alt && img.src)
				.map(img =>
					this.signImage(
						img,
						'Mundo Das Mensagens',
						'https://www.mundodasmensagens.com'
					)
				),
			...mensagensComAmor.data.images
				.filter(img => img.alt && img.src)
				.map(img =>
					this.signImage(
						img,
						'Mensagens Com Amor',
						'https://www.mensagenscomamor.com'
					)
				),
			...belasMensagens.data.images
				.filter(img => img.alt && img.src)
				.map(img =>
					this.signImage(img, 'Belas Mensagens', 'https://www.belasmensagens.com.br')
				),
		]);
	}

	private signImage(img: { src: string; alt: string }, name: string, url: string) {
		return {
			...img,
			alt: (img.alt += '\n\n' + `Fonte: ${name}\n` + url),
		};
	}

	private signText(text: string, name: string, url: string) {
		return [text, '', `Fonte: ${name}`, url].join('\n');
	}
}

export default MensagensModule;
