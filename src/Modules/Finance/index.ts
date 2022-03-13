import { Message } from '@open-wa/wa-automate';
import { bold, italic } from 'src/Helpers/TextFormatter';
import { Args, Module } from '../ModulesRegister';
import FinanceAPI from './API';
import * as util from './util';
import fs from 'fs/promises';

class Finance extends Module {
	API: FinanceAPI;

	constructor() {
		super();
		this.API = new FinanceAPI();

		['stock', 'ação', 'acao', 'açao', 'acão'].map(methodName =>
			this.registerPublicMethod({
				name: methodName,
				method: this.stock.bind(this),
			})
		);

		['exchange', 'cambio', 'câmbio', 'cotação', 'cotacao', 'cotaçao', 'cotacão'].map(
			methodName =>
				this.registerPublicMethod({
					name: methodName,
					method: this.exchange.bind(this),
				})
		);
	}

	async stock(args: Args) {
		const requester = this.zaplify?.messageObject as Message;
		try {
			const stockSymbol = args.immediate;

			if (!stockSymbol)
				return this.zaplify?.replyAuthor(
					'Insira uma ação pra eu pesquisar o preço',
					requester
				);

			const result = await this.API.stock(stockSymbol);
			if (!result)
				return this.zaplify?.replyAuthor(
					'Não encontrei nada. Verifique o simbolo da ação e tente novamente',
					requester
				);

			const stockResult = result.results[stockSymbol];
			const message = [
				bold(`Ação ${stockResult.symbol}: ${stockResult.company_name}`),
				`${italic(stockResult.description)}`,
				``,
				`Preço de mercado: ${util.toMoneyString(stockResult.price)}`,
				`Abertura: ${stockResult.market_time.open}`,
				`Fechamento: ${stockResult.market_time.close}`,
				`Variação: ${stockResult.change_percent}%`,
				``,
				`${stockResult.website}`,
			].join('\n');
			return this.zaplify?.replyAuthor(message, requester);
		} catch (e) {
			console.log(e);
			this.zaplify?.replyAuthor(
				'Deu erro, se liga: ' + JSON.stringify(e),
				requester
			);
		}
	}

	async exchange(args: Args) {
		const requester = this.zaplify?.messageObject as Message;
		try {
			const [from = undefined, to = 'BRL'] =
				args.immediate?.toUpperCase().trim().split(' ') || [];

			if (!from)
				return this.zaplify?.replyAuthor(
					'Preciso de uma moeda ou cryptomoeda para informar o câmbio',
					requester
				);

			const result = await this.API.exchange(from, to);
			const message = [
				`${bold(`Câmbio de ${from} x ${to}`)}`,
				``,
				`1 ${result.to}(${result.toCode}) vale ${util.toMoneyString(
					result.exchangeRate
				)} ${result.from}(${result.fromCode})`,
			].join('\n');

			return this.zaplify?.replyAuthor(message, requester);
		} catch (e) {
			console.log(e);
			this.zaplify?.replyAuthor(
				'Deu erro, se liga: ' + JSON.stringify(e),
				requester
			);
		}
	}

	async sendInstructions() {
		fs.readFile('src/Modules/Finance/Help.txt', {
			encoding: 'utf-8',
		}).then(helpText => {
			this.zaplify?.replyAuthor(helpText);
		});
	}
}

export default Finance;
