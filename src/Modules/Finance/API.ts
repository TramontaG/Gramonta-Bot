import axios, { AxiosInstance } from 'axios';

type MarketTime = {
	open: string;
	close: string;
	timezone: number;
};

type StockData = {
	symbol: string;
	name: string;
	company_name: string;
	document: string;
	description: string;
	website: string;
	region: string;
	currency: string;
	market_time: MarketTime;
	market_cap: number;
	price: number;
	change_percent: number;
	updated_at: string;
};

type StocksResponse<T extends string> = {
	by: string;
	valid_key: boolean;
	execution_time: number;
	from_cache: boolean;
	results: {
		[key in T]: StockData;
	};
};

const getAlphaVintageKey = () => process.env.ALPHA_VINTAGE_KEY;
const getHGKey = () => process.env.HG_KEY;

type ExchangeResponse = {
	['Realtime Currency Exchange Rate']: {
		['1. From_Currency Code']: string;
		['2. From_Currency Name']: string;
		['3. To_Currency Code']: string;
		['4. To_Currency Name']: string;
		['5. Exchange Rate']: string;
		['6. Last Refreshed']: string;
		['7. Time Zone']: string;
		['8. Bid Price']: string;
		['9. Ask Price']: string;
	};
	['Error Message']: string;
};

class FinanceAPI {
	private exchangeAPI: AxiosInstance;
	private stocksAPI: AxiosInstance;

	constructor() {
		this.exchangeAPI = axios.create({
			baseURL: 'https://www.alphavantage.co',
		});

		this.exchangeAPI.interceptors.request.use(requestConfig => {
			const ALPHA_VINTAGE_API_KEY = getAlphaVintageKey();
			return {
				...requestConfig,
				params: {
					...requestConfig.params,
					apikey: ALPHA_VINTAGE_API_KEY,
				},
			};
		});

		this.stocksAPI = axios.create({
			baseURL: 'https://api.hgbrasil.com/finance',
		});

		this.stocksAPI.interceptors.request.use(requestConfig => {
			const HG_API_KEY = getHGKey();
			return {
				...requestConfig,
				params: {
					...requestConfig.params,
					key: HG_API_KEY,
				},
			};
		});
	}

	static util = {
		round: (number: number) => Math.round(number * 100) / 100,
	};

	private exchangeToFriendlyJson(exchange: ExchangeResponse) {
		const { round } = FinanceAPI.util;
		const exchangeRateAsNumber = Number(
			exchange['Realtime Currency Exchange Rate']['5. Exchange Rate']
		);

		return {
			exchangeRate: round(exchangeRateAsNumber),
			from: exchange['Realtime Currency Exchange Rate']['2. From_Currency Name'],
			fromCode: exchange['Realtime Currency Exchange Rate']['1. From_Currency Code'],
			to: exchange['Realtime Currency Exchange Rate']['4. To_Currency Name'],
			toCode: exchange['Realtime Currency Exchange Rate']['3. To_Currency Code'],
		};
	}

	async exchange(from: string, to: string = 'BRL') {
		const response = await this.exchangeAPI.get<ExchangeResponse>('/query', {
			params: {
				function: 'CURRENCY_EXCHANGE_RATE',
				from_currency: from,
				to_currency: to,
			},
		});

		if (response.data['Error Message']) throw response.data['Error Message'];

		return this.exchangeToFriendlyJson(response.data);
	}

	async stock<T extends string>(symbol: T) {
		const result = await this.stocksAPI.get<StocksResponse<T>>('/stock_price', {
			params: {
				symbol,
			},
		});

		if (!result.data.valid_key) return null;

		return result.data;
	}
}

export default FinanceAPI;
