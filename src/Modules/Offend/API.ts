import axios, { AxiosInstance } from 'axios';

type OffenseResponse = {
	xingamento: string;
};

export default class OffenseAPI {
	instance: AxiosInstance;

	constructor() {
		this.instance = axios.create({
			baseURL: 'http://xinga-me.appspot.com/',
		});
	}

	getRandomOffense() {
		return this.instance
			.get<OffenseResponse>('/api')
			.then(resp => resp.data)
			.catch(e => undefined);
	}
}
