import { Message } from '@open-wa/wa-automate';
import { AllEntitiesModel, EntityTypes } from 'src/BigData/JsonDB';
import { Args, Module } from '../ModulesRegister';
import Logger from './Logger';

class LoggerModule extends Module {
	logger: Logger;

	constructor() {
		super();
		this.logger = new Logger();

		[
			EntityTypes.COPYPASTAS,
			EntityTypes.GOOGLESEARCHES,
			EntityTypes.SONGS,
			EntityTypes.STICKERS,
			EntityTypes.LYRICS,
			EntityTypes.HOROSCOPE,
		].forEach(entityType => {
			console.log('REGISTERING LOG FOR ', entityType);
			this.registerPublicMethod({
				name: entityType,
				method: () => this.logAll(entityType),
			});
		});

		this.registerPublicMethod({
			name: 'reset',
			method: () => this.reset(),
		});
	}

	async logAll(module: EntityTypes) {
		const requester = this.zaplify?.messageObject as Message;
		const allRegisters = await this.logger.getAllEntities(module);

		console.log(allRegisters);

		let message = [
			`*_Registro de ${module}:_*\n`,
			`Total de ${module} enviados: *_${allRegisters.length}_*`,
			`Grupo que mais usou esse comando: *_${this.mostUsedGroup(allRegisters)}_*`,
			`Pessoa que mais usou esse comando: *_${this.mostUsedPerson(allRegisters)}_*`,
		].join('\n');

		this.zaplify?.replyAuthor(message, requester);
	}

	mostUsedGroup<T extends keyof AllEntitiesModel>(
		allEntities: AllEntitiesModel[T][]
	) {
		//creating hashmap for counting how many uses each group has
		const usesByGroup = {} as {
			[key: string]: {
				groupName: string;
				amount: number;
			};
		};

		//filling the hashmap
		allEntities.forEach(entity => {
			if (entity.groupName === '_') return;

			if (usesByGroup[entity.chatId]) {
				usesByGroup[entity.chatId].groupName = entity.groupName;
				usesByGroup[entity.chatId].amount = usesByGroup[entity.chatId].amount + 1;
				return;
			}

			usesByGroup[entity.chatId] = {
				amount: 1,
				groupName: entity.groupName,
			};
		});

		console.log(usesByGroup);

		//getting the key with maximum value from the hashmap
		let mostUses = 0;
		let mostUsedGroup = '';

		Object.keys(usesByGroup).forEach(key => {
			if (usesByGroup[key].amount > mostUses) {
				mostUses = usesByGroup[key].amount;
				mostUsedGroup = usesByGroup[key].groupName;
			}
		});

		return mostUsedGroup;
	}

	mostUsedPerson<T extends keyof AllEntitiesModel>(
		allEntities: AllEntitiesModel[T][]
	) {
		//creating hashmap for counting how many uses each group has
		const usesByPerson = {} as { [key: string]: number };

		//filling the hashmap
		allEntities.forEach(entity => {
			if (usesByPerson[entity.requester])
				return (usesByPerson[entity.requester] += 1);
			return (usesByPerson[entity.requester] = 1);
		});

		console.log(usesByPerson);

		//getting the key with maximum value from the hashmap
		let mostUses = 0;
		let mostUsedPerson = '';

		Object.keys(usesByPerson).forEach(key => {
			if (usesByPerson[key] > mostUses) {
				mostUses = usesByPerson[key];
				mostUsedPerson = key;
			}
		});

		return mostUsedPerson;
	}

	sendError(requester: Message, error: string) {
		this.zaplify?.replyAuthor(`Erro: ${error}`, requester);
	}

	reset() {
		this.logger.clearDatabase();
		this.zaplify?.replyAuthor('Database limpo');
	}
}

export default new LoggerModule();
