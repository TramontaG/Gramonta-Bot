import { Message } from '@open-wa/wa-automate';
import { AllEntitiesModel, EntityTypes } from 'src/BigData/JsonDB';
import { Args, Module } from '../ModulesRegister';
import Logger from './Logger';

type GroupMap = {
	[key: string]: {
		groupName: string;
		amount: number;
	};
};

type PersonMap = {
	[key: string]: number;
};

const EntitiesArray = [
	EntityTypes.STICKERS,
	EntityTypes.COPYPASTAS,
	EntityTypes.GOOGLESEARCHES,
	EntityTypes.SONGS,
	EntityTypes.LYRICS,
	EntityTypes.HOROSCOPE,
];

class LoggerModule extends Module {
	logger: Logger;

	constructor() {
		super();
		this.logger = new Logger();

		EntitiesArray.forEach(entityType => {
			this.registerPublicMethod({
				name: entityType,
				method: () => this.logAll(entityType),
			});
		});

		this.registerPublicMethod({
			name: 'rank',
			method: (args: Args) => this.rank(args),
		});

		// this.registerPublicMethod({
		// 	name: 'reset',
		// 	method: () => this.reset(),
		// });

		this.registerPublicMethod({
			name: 'me',
			method: (args: Args) => this.me(args),
		});
	}

	async history(args: Args) {
		const requester = this.zaplify?.messageObject as Message;
		const entityType = args.immediate?.trim() as EntityTypes;

		if (!entityType)
			return this.zaplify?.replyAuthor('Por favor insira algum comando para logar!');
		if (!EntitiesArray.includes(entityType))
			return this.zaplify?.replyAuthor('Não consigo logar isso, comando inválido!');

		const allEntities = await this.logger.getAllEntities(entityType);

		let message = [];
	}

	async logAll(entityType: EntityTypes) {
		const requester = this.zaplify?.messageObject as Message;
		const allRegisters = await this.logger.getAllEntities(entityType);
		const personMap = this.getPersonMap(allRegisters);
		const groupMap = this.getGroupMap(allRegisters);

		let message = [
			`*_Registro de ${entityType}:_*\n`,
			`Total de ${entityType} enviados: *_${allRegisters.length}_*`,
			`Grupo que mais usou esse comando: *_${this.mostUsedGroup(groupMap)}_*`,
			`Pessoa que mais usou esse comando: *_${this.mostUsedPerson(personMap)}_*`,
		].join('\n');

		this.zaplify?.replyAuthor(message, requester);
	}

	async rank(args: Args) {
		const requester = this.zaplify?.messageObject as Message;
		const entityType = args.immediate?.trim() as EntityTypes;

		if (!entityType)
			return this.zaplify?.replyAuthor('Por favor insira algum comando para logar!');
		if (!EntitiesArray.includes(entityType))
			return this.zaplify?.replyAuthor('Não consigo logar isso, comando inválido!');

		const allEntities = await this.logger.getAllEntities(entityType);
		const groupMap = this.getGroupMap(allEntities);
		const personMap = this.getPersonMap(allEntities);

		const personRank = this.getPersonRank(personMap);
		const groupRank = this.getGroupRank(groupMap);

		let message = [
			`*_Ranking de ${entityType}:_*\n`,
			`Total de ${entityType} enviados: *_${allEntities.length}_*`,
			'',

			`*_RANKING DE USOS DE ${entityType.toUpperCase()} POR PESSOA_*`,
			`${personRank.slice(0, 10).reduce((acc, person, index) => {
				return (acc += `*${index + 1}* - ${this.censorNumber(person.person)}: Usou ${
					person.amount
				} vezes\n`);
			}, '')}`,

			`*_RANKING DE USOS DE ${entityType.toUpperCase()} POR GRUPO_*`,
			`${groupRank.reduce((acc, group, index) => {
				return (acc += `*${index + 1}* - ${group.group}: Usado ${
					group.amount
				} vezes\n`);
			}, '')}`,

			`Total de grupos que já usou esse comando: ${groupRank.length}`,
			`Total de pessoas que já usaram esse comando: ${personRank.length}`,
		].join('\n');

		this.zaplify?.replyAuthor(message, requester);
	}

	async me(_: Args) {
		const requester = this.zaplify?.messageObject as Message;
		let message = '*Seu uso do bot*\n';
		EntitiesArray.forEach(async (entity, index) => {
			const totalUse = await this.getTotalUse(
				entity,
				requester.sender.formattedName
			);
			message += `*${entity}:* _${totalUse} vezes_\n`;
			if (index === EntitiesArray.length - 1) {
				this.zaplify?.replyAuthor(message, requester);
			}
		});
	}

	private async getTotalUse(entityType: EntityTypes, senderName: string) {
		const allEntities = await this.logger.getAllEntities(entityType);
		const personMap = this.getPersonMap(allEntities);
		return personMap[senderName] || 0;
	}

	private censorNumber(number: string) {
		return number.split('-')[0] + ' - **' + number.substr(15, 17);
	}

	private getPersonRank(personMap: PersonMap) {
		return Object.keys(personMap)
			.map(person => {
				return {
					person,
					amount: personMap[person],
				};
			})
			.sort((a, b) => b.amount - a.amount);
	}

	private getGroupRank(groupMap: GroupMap) {
		return Object.keys(groupMap)
			.map(group => {
				return {
					group: groupMap[group].groupName,
					amount: groupMap[group].amount,
				};
			})
			.sort((a, b) => b.amount - a.amount);
	}

	private mostUsedGroup(groupMap: GroupMap) {
		let mostUses = 0;
		let mostUsedGroup = '';

		Object.keys(groupMap).forEach(key => {
			if (groupMap[key].amount > mostUses) {
				mostUses = groupMap[key].amount;
				mostUsedGroup = groupMap[key].groupName;
			}
		});

		return mostUsedGroup;
	}

	private mostUsedPerson(personMap: PersonMap) {
		let mostUses = 0;
		let mostUsedPerson = '';

		Object.keys(personMap).forEach(key => {
			if (personMap[key] > mostUses) {
				mostUses = personMap[key];
				mostUsedPerson = key;
			}
		});

		return mostUsedPerson;
	}

	private getGroupMap<T extends keyof AllEntitiesModel>(
		allEntities: AllEntitiesModel[T][]
	) {
		const groupMap: GroupMap = {};

		allEntities.forEach(entity => {
			if (entity.groupName === '_') return;

			if (groupMap[entity.chatId]) {
				groupMap[entity.chatId].groupName = entity.groupName;
				groupMap[entity.chatId].amount = groupMap[entity.chatId].amount + 1;
				return;
			}

			groupMap[entity.chatId] = {
				amount: 1,
				groupName: entity.groupName,
			};
		});

		return groupMap;
	}

	private getPersonMap<T extends keyof AllEntitiesModel>(
		allEntities: AllEntitiesModel[T][]
	) {
		const usesByPerson: PersonMap = {};

		allEntities.forEach(entity => {
			if (usesByPerson[entity.requester])
				return (usesByPerson[entity.requester] += 1);
			return (usesByPerson[entity.requester] = 1);
		});

		return usesByPerson;
	}

	private sendError(requester: Message, error: string) {
		this.zaplify?.replyAuthor(`Erro: ${error}`, requester);
	}

	private reset() {
		this.logger.clearDatabase();
		this.zaplify?.replyAuthor('Database limpo');
	}
}

export default new LoggerModule();
