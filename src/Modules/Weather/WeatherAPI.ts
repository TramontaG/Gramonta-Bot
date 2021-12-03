import axios, { AxiosInstance } from 'axios';
import { WeatherData } from './Models';

class WeatherAPI {
	API: AxiosInstance;

	constructor() {
		this.API = axios.create({
			baseURL: 'https://weather.contrateumdev.com.br',
		});
	}

	async getWeatherFromCity(city: string) {
		const weather = await this.API.get<WeatherData>('api/weather/city', {
			params: {
				city,
			},
		});
		return weather.data;
	}
}

export default WeatherAPI;
