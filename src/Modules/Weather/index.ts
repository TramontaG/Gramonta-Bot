import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import { Message } from '@open-wa/wa-automate';
import WeatherAPI from './WeatherAPI';
import * as F from 'src/Helpers/TextFormatter';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';

class Weather extends Module {
	weatherAPI: WeatherAPI;
	Logger: Logger;

	constructor() {
		super();

		this.weatherAPI = new WeatherAPI();
		this.Logger = new Logger();

		this.registerPublicMethod({
			name: 'help',
			method: this.sendHelp.bind(this),
		});
		
		this.registerPublicMethod({
			name: 'default',
			method: this.fromCity.bind(this),
		});
	}

	async fromCity(args: Args) {
		const requester = this.zaplify?.messageObject as Message;
		const city = args.immediate?.trim() || args.method;
		if (!city) return this.zaplify?.replyAuthor('Por favor, insira uma cidade');

		try {
			const weather = await this.weatherAPI.getWeatherFromCity(city);
			if (weather.cod == 404)
				return this.zaplify?.replyAuthor(
					`Ih, deu ruim. Não encontrei essa cidade, erro ${weather.cod}`,
					requester
				);
			if (weather.cod != 200)
				return this.zaplify?.replyAuthor(
					`Ih, deu ruim. Request voltou com status ${weather.cod}`,
					requester
				);

			if (!requester.id.startsWith('Debug')) {
				this.Logger.insertNew(EntityTypes.WEATHER, {
					query: city,
					groupName: requester.isGroupMsg ? requester.chat.name : '_',
					chatId: requester.chat.id,
					requester: requester.sender.formattedName,
					date: new Date().getTime(),
				});
			}

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
			this.zaplify?.replyAuthor('Erro desconhcido: ' + e, requester);
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

export default Weather;
