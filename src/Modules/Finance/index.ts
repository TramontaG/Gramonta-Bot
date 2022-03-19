import { Message } from '@open-wa/wa-automate';
import { bold, italic } from 'src/Helpers/TextFormatter';
import { Args, Module } from '../ModulesRegister';
import FinanceAPI from './API';
import * as util from './util';
import fs from 'fs/promises';
import Logger from '../Logger/Logger';

class Finance extends Module {
	API: FinanceAPI;
	logger: Logger;

	constructor() {
		super();
		this.API = new FinanceAPI();
		this.logger = new Logger();

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

		this.registerPublicMethod({
			name: 'default',
			method: this.sendInstructions.bind(this),
		});
	}

	async stock(args: Args) {
		const requester = this.zaplify?.messageObject as Message;
		try {
			const stockSymbol = args.immediate?.trim().toUpperCase();

			if (!stockSymbol)
				return this.zaplify?.replyAuthor(
					'Insira uma ação pra eu pesquisar o preço',
					requester
				);

			const stockResult = await this.API.stock(stockSymbol);
			if (!stockResult)
				return this.zaplify?.replyAuthor(
					'Não encontrei nada. Verifique o simbolo da ação e tente novamente',
					requester
				);

			if (!requester.id.startsWith('Debug')) {
				this.logger.insertNew('finance', {
					groupName: requester.isGroupMsg ? requester.chat.name : '_',
					chatId: requester.chat.id,
					requester: requester.sender.formattedName,
					operation: 'stock',
					values: [stockSymbol],
					date: new Date().getTime(),
				});
			}

			const message = [
				bold(`Ação ${stockResult.symbol}: ${stockResult.name}`),
				`${italic(stockResult.description || '')}`,
				`Preço de mercado: ${util.toMoneyString(stockResult.price)}`,
				`Variação: ${stockResult.change_percent}%`,
				`Abertura: ${stockResult.market_time.open}`,
				`Fechamento: ${stockResult.market_time.close}`,
				``,
				`${stockResult.website}`,
				``,
				`${bold('Para mais detalhes acesse o site:')}`,
				`${this.getOverviewWebsite(stockSymbol)}`,
			].join('\n');

			return this.zaplify?.replyAuthor(message, requester);
		} catch (e) {
			this.zaplify?.replyAuthor(
				'Deu erro, confira o simbolo da ação ou fundo e tente novamente',
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
				`${bold(`Câmbio de ${to} x ${from}`)}`,
				``,
				`1 ${result.from}(${result.fromCode}) vale ${util.toMoneyString(
					result.exchangeRate
				)} ${result.to}(${result.toCode})`,
			].join('\n');

			if (!requester.id.startsWith('Debug')) {
				this.logger.insertNew('finance', {
					groupName: requester.isGroupMsg ? requester.chat.name : '_',
					chatId: requester.chat.id,
					requester: requester.sender.formattedName,
					operation: 'stock',
					values: [from, to],
					date: new Date().getTime(),
				});
			}

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

	private getOverviewWebsite(symbol: string) {
		if (symbol.endsWith('11'))
			return `https://statusinvest.com.br/fundos-imobiliarios/${symbol}`;
		return `https://statusinvest.com.br/acoes/${symbol}`;
	}
}

export default Finance;
