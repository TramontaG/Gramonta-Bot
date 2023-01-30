import Axios, { AxiosInstance } from 'axios';
import Memo from 'html-memo';
import { JSDOM } from 'jsdom';

class HoroscopeAPI {
	instance: AxiosInstance;

	constructor() {
		this.instance = Axios.create({
			baseURL: 'https://gadget.horoscopovirtual.com.br',
		});
	}

	async getDaily() {
		try {
			return this.instance.get<string>('/').then(resp => resp.data);
		} catch (e) {
			console.warn(e);
			return '';
		}
	}
}

/**
 * 3 hours of cache
 */
const HoroscopeGetter = new Memo(html => new JSDOM(html), 1000 * 60 * 60 * 3);

class Horoscope {
	memo: Memo<JSDOM>;
	API: HoroscopeAPI;

	constructor() {
		this.API = new HoroscopeAPI();
		this.memo = HoroscopeGetter;
	}

	async getDaily(sign: string) {
		const website = await this.memo.getWebsite('daily', () => this.API.getDaily());

		const horoscope = website!.window.document.querySelector(
			`.previsoes-container > .${sign} > article > div > p`
		)?.textContent;

		return horoscope?.replace(/Compartilhar(\s*\n*)+$/, '');
	}
}

export default Horoscope;
