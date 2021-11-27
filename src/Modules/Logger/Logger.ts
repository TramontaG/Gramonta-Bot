import Database, { EntityTypes, AllEntitiesModel } from '../../BigData/JsonDB';

type FilterFn = (_entity: keyof AllEntitiesModel, _index: number) => boolean;

class Logger {
	DB: Database;
	constructor() {
		this.DB = new Database();
	}

	private all(_entity: keyof AllEntitiesModel, _index: number) {
		return true;
	}

	async getAllEntities<T extends keyof AllEntitiesModel>(entityName: T) {
		return this.getEntities(entityName, this.all);
	}

	async getEntities<T extends keyof AllEntitiesModel>(
		entityName: T,
		filterFunction: FilterFn
	) {
		const DB = await this.DB.getInstance();
		const objects = DB.objects<T>(entityName);
		return JSON.parse(JSON.stringify(objects)).filter(
			filterFunction
		) as AllEntitiesModel[T][];
	}

	async clearDatabase() {
		const DB = await this.DB.getInstance();
		DB.write(() => {
			DB.deleteAll();
		});
	}

	async insertNew<T extends keyof AllEntitiesModel>(
		entityName: T,
		entityData: AllEntitiesModel[T]
	) {
		try {
			const DB = await this.DB.getInstance();
			const id = await this.DB.incrementID(entityName);
			DB.write(() => {
				const newEntity = DB.create(entityName, { ...entityData, id });
			});
		} catch (e) {
			console.warn(e);
		}
	}
}

export default Logger;
