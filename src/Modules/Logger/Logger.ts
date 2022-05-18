import Database, {
	EntityTypes,
	AllEntitiesModel,
	WithID,
} from '../../BigData/JsonDB';

type FilterFn = <T extends keyof AllEntitiesModel>(
	_entity: WithID<T>,
	_index: number
) => boolean;

class Logger {
	DB: Database;
	constructor() {
		this.DB = new Database();
	}

	private all<T extends keyof AllEntitiesModel>(
		_entity: AllEntitiesModel[T],
		_index: number
	) {
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
		return objects.toJSON().filter(filterFunction) as AllEntitiesModel[T][];
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

	async getEntityById<T extends keyof AllEntitiesModel>(
		entityName: T,
		entityId: number
	) {
		try {
			const DB = await this.DB.getInstance();
			const objects = DB.objects<T>(entityName).toJSON() as WithID<T>[];
			return objects.filter(obj => obj.id === entityId)[0];
		} catch (e) {
			console.warn(e);
		}
	}

	async updateObject<T extends keyof AllEntitiesModel>(
		entityName: T,
		entityID: number,
		entityData: WithID<T>
	) {
		try {
			const DB = await this.DB.getInstance();
			DB.write(() => {
				let entity = DB.objects<WithID<T>>(entityName).filter(
					obj => obj.id === entityID
				)[0];
				entity = { ...entity, ...entityData };
			});
		} catch (e) {
			console.warn(e);
		}
	}
}

export default Logger;
