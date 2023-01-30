import { Args, Module } from '../ModulesRegister';
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

		this.makePublic('help', this.sendHelp);
		this.makePublic('default', this.fromCity);
		this.messagesPath = './src/Modules/Weather/messages.zap.md';
	}

	async fromCity(args: Args, requester: Message) {
		const location = `${args.method} ${args.immediate}`.replace(/^city/, '');

		if (!location) return this.sendMessageFromTemplate('EmptyQuery', requester);

		try {
			const weather = await this.weatherAPI.getWeatherFromCity(location);
			if (weather.cod == 404)
				return this.sendMessageFromTemplate('NotFound', requester);
			if (weather.cod != 200)
				return this.sendMessageFromTemplate('Error', requester, {
					error:
						'Não consegui efetuar a consulta do clima. Tente novamente mais tarde. ReqStatus:' +
						weather.cod,
				});

			this.logWeather(location, requester);

			return this.sendMessageFromTemplate('Weather', requester, {
				location,
				description: weather.weather[0].description,
				temperature: weather.main.temp.toString().replace('.', ',') + 'ºC',
				minimum: weather.main.temp_min.toString().replace('.', ',') + 'ºC',
				maximum: weather.main.temp_max.toString().replace('.', ',') + 'ºC',
				feelsLike: weather.main.feels_like.toString().replace('.', ',') + 'ºC',
				humidity: weather.main.humidity.toString().replace('.', ',') + '%',
			});
		} catch (e) {
			return this.sendMessageFromTemplate('Error', requester, {
				error: e,
			});
		}
	}

	async sendHelp(_: Args, requester: Message) {
		return this.sendMessageFromTemplate('Help', requester);
	}

	async logWeather(location: string, requester: Message) {
		return this.Logger.insertNew(EntityTypes.WEATHER, {
			query: location,
			groupName: requester.isGroupMsg ? requester.chat.name : '_',
			chatId: requester.chat.id,
			requester: requester.sender.formattedName,
			date: new Date().getTime(),
		});
	}
}

export default Weather;
