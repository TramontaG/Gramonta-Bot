import axios, { AxiosInstance } from 'axios';

type Activity = {
	activity: string;
	accessibility: number;
	type: string;
	participants: number;
	price: number;
	link: string;
	key: string;
};

class BoredApi {
	instance: AxiosInstance;

	constructor() {
		this.instance = axios.create({
			baseURL: 'http://www.boredapi.com/',
		});
	}

	async getRandom() {
		const randomActivity = await this.instance.get<Activity>('api/activity');
		return randomActivity.data;
	}
}

export default BoredApi;
