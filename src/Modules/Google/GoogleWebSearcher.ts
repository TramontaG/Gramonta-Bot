import axios from 'axios';

interface SearchOptions {
	page?: string;
}

class GoogleWebSearcher {
	apiKey: string;
	googleKey: string;
	baseUrl: string;

	constructor(apiKey: string, googleKey: string) {
		this.apiKey = apiKey;
		this.googleKey = googleKey;
		this.baseUrl = 'https://www.googleapis.com';
	}

	search(query: string, options?: SearchOptions) {
		const url = `${this.baseUrl}/customsearch/v1`;
		const params = {
			q: query.replace(/\s/g, '+'),
			cx: this.googleKey,
			key: this.apiKey,
		};
		return axios.get(url, { params });
	}
}

export default GoogleWebSearcher;
