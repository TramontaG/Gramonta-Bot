import axios, { AxiosInstance } from 'axios';
import GoogleImages from 'google-images';

class GoogleAPI {
	private apiKey: string;
	private googleKey: string;
	private webAPI: AxiosInstance;
	private imageAPI: GoogleImages;

	constructor(apiKey: string, googleKey: string) {
		this.apiKey = apiKey;
		this.googleKey = googleKey;

		this.webAPI = axios.create({
			baseURL: 'https://www.googleapis.com',
		});

		this.imageAPI = new GoogleImages(googleKey, apiKey);
	}

	// [TODO]: strong-typing this return;
	searchWeb(query: string) {
		const params = {
			q: query.replace(/\s/g, '+'),
			cx: this.googleKey,
			key: this.apiKey,
		};
		return this.webAPI.get('/customsearch/v1', { params }).then(resp => resp.data);
	}

	searchImages(query: string, amount = 5) {
		return this.imageAPI
			.search(query, {
				safe: 'high',
			})
			.then(result => this.filterValid(result))
			.then(results => results.slice(0, amount - 1))
			.catch(_ => []);
	}

	private async checkValid(result: GoogleImages.Image): Promise<boolean> {
		if (result.type !== 'image/jpeg') return false;
		if (!result.url.startsWith('https')) return false;

		return axios
			.get(result.url)
			.then(_ => true)
			.catch(_ => false);
	}

	private filterValid(results: GoogleImages.Image[]): Promise<GoogleImages.Image[]> {
		const filterPromises = results.map(this.checkValid);
		return Promise.all(filterPromises).then(valid => {
			return results
				.filter((res, i) => (valid[i] ? res : undefined))
				.filter(res => !!res);
		});
	}
}

export default GoogleAPI;
