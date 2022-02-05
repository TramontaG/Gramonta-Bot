import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import { Message } from '@open-wa/wa-automate';
import WeatherAPI from './WeatherAPI';
import * as F from 'src/Helpers/TextFormatter';
import { json } from 'express';

class Weather extends Module {
	weatherAPI: WeatherAPI;

	constructor() {
		super();

		this.weatherAPI = new WeatherAPI();

		this.registerPublicMethod({
			name: 'default',
			method: this.sendHelp.bind(this),
		});
		this.registerPublicMethod({
			name: 'city',
			method: this.fromCity.bind(this),
		});
	}

	async fromCity(args: Args) {
		const requester = this.zaplify?.messageObject as Message;
		const city = args.immediate?.trim();
		if (!city)
			return this.zaplify?.replyAuthor('Por favor, insira uma cidade', requester);

		try {
			const weather = await this.weatherAPI.getWeatherFromCity(city);
			if (weather.cod === 404)
				return this.zaplify?.replyAuthor(
					`Ih, deu ruim. Não encontrei essa cidade, erro ${weather.cod}`
				);
			if (weather.cod !== 200)
				return this.zaplify?.replyAuthor(
					`Ih, deu ruim. Request voltou com status ${weather.cod}`
				);

			const message = [
				`${F.italic(F.bold(`Clima atual de ${weather.name}`))}`,
				'',
				`${F.monospace('Clima:')} ${F.bold(weather.weather[0].description)}`,
				`${F.monospace('Temperatura Atual:')} ${F.bold(
					weather.main.temp.toString().replace('.', ',') + 'ºC'
				)}`,
				`${F.monospace('Min:')} ${F.bold(
					weather.main.temp_min.toString().replace('.', ',') + 'ºC'
				)}, ${F.monospace('Max:')} ${F.bold(
					weather.main.temp_max.toString().replace('.', ',') + 'ºC'
				)}`,
				`${F.monospace('Sensação Térmica:')} ${F.bold(
					weather.main.feels_like.toString().replace('.', ',') + 'ºC'
				)}`,
				`${F.monospace('Umidade:')} ${F.bold(
					weather.main.humidity.toString().replace('.', ',') + '%'
				)}`,
			].join('\n');
			this.zaplify?.replyAuthor(message, requester);
		} catch (e) {
			this.zaplify?.replyAuthor('Erro desconhcido: ' + JSON.stringify(e), requester);
		}
	}

	async sendHelp() {
		const requester = this.zaplify?.messageObject;
		const helpText = await fs.readFile('src/Modules/Weather/Help.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText, requester as Message);
	}
}

export default new Weather();
