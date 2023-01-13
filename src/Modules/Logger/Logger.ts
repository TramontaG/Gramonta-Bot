import Database, {
	EntityTypes,
	AllEntitiesModel,
	WithID,
} from '../../BigData/JsonDB';

type FilterFn<T extends keyof AllEntitiesModel> = (
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
		filterFunction: FilterFn<T>
	) {
		const DB = await this.DB.getInstance();
		const objects = DB.objects<WithID<T>>(entityName);
		const objJSON = objects.toJSON() as WithID<T>[];
		return objJSON.filter((obj, index) => filterFunction(obj, index));
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

	async upsert<T extends keyof AllEntitiesModel>(
		entityName: T,
		entityData: AllEntitiesModel[T]
	) {
		try {
			const DB = await this.DB.getInstance();
			DB.write(() => {
				// typing is wrong, Docs says that this method call is correct:
				// https://www.mongodb.com/docs/realm/sdk/node/examples/read-and-write-data/#upsert-an-object
				// @ts-ignore
				DB.create(entityName, entityData, Realm.UpdateMode.Modified);
			});
		} catch (e) {
			console.warn(e);
		}
	}

	async deleteEntity<T extends keyof AllEntitiesModel>(
		entityName: T,
		entityId: string | number
	) {
		try {
			const DB = await this.DB.getInstance();
			DB.write(() => {
				const obj = DB.objectForPrimaryKey(entityName, entityId);
				DB.delete(obj);
			});
		} catch (e) {
			console.warn(e);
		}
	}
}

export default Logger;
