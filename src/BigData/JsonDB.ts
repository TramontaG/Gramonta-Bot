import Realm from 'realm';

class Database {
	DatabaseVersion: number;
	_RealmInstance: Realm | undefined;
	constructor() {
		this.DatabaseVersion = 5;
		this._RealmInstance = undefined;
	}

	private init = async () => {
		this._RealmInstance = await this.openRealm();
		return this._RealmInstance;
	};

	getInstance = async () => {
		if (this._RealmInstance) return this._RealmInstance;
		return this.init();
	};

	async incrementID(entity: string) {
		const realm = await this.getInstance();
		const maxId = realm.objects(entity).max('id') as number;
		return maxId + 1 || 1;
	}

	async incrementValue(entity: string, key: string) {
		const realm = await this.getInstance();
		const maxId = realm.objects(entity).max(key) as number;
		return maxId + 1 || 1;
	}

	private async openRealm() {
		const config = {
			schema: Object.values(this.schemas),
			schemaVersion: this.DatabaseVersion,
		};
		return new Realm(config);
	}

	schemas = {
		sticker: {
			name: 'stickers',
			primaryKey: 'id',
			properties: {
				id: { type: 'int', indexed: true },
				chatId: 'string',
				groupName: 'string',
				requester: 'string',
				animated: 'bool',
			},
		},
		songs: {
			name: 'songs',
			primaryKey: 'id',
			properties: {
				id: { type: 'int', indexed: true },
				chatId: 'string',
				groupName: 'string',
				requester: 'string',
				songName: 'string',
			},
		},
		copypasta: {
			name: 'copypastas',
			primaryKey: 'id',
			properties: {
				id: { type: 'int', indexed: true },
				chatId: 'string',
				groupName: 'string',
				requester: 'string',
				copypastaName: 'string',
			},
		},
		googleSearch: {
			name: 'googleSearches',
			primaryKey: 'id',
			properties: {
				id: { type: 'int', indexed: true },
				groupName: 'string',
				chatId: 'string',
				requester: 'string',
				query: 'string',
				type: 'string',
			},
		},
		lyrics: {
			name: 'lyrics',
			primaryKey: 'id',
			properties: {
				id: { type: 'int', indexed: true },
				groupName: 'string',
				chatId: 'string',
				requester: 'string',
				query: 'string',
			},
		},
		horoscope: {
			name: 'horoscope',
			primaryKey: 'id',
			properties: {
				id: { type: 'int', indexed: true },
				groupName: 'string',
				chatId: 'string',
				requester: 'string',
				sign: 'string',
			},
		},
	};
}

export type AllEntitiesModel = {
	copypastas: {
		groupName: string;
		chatId: string;
		requester: string;
		copypastaName: string;
	};
	stickers: {
		groupName: string;
		chatId: string;
		requester: string;
		animated: boolean;
	};
	songs: {
		groupName: string;
		chatId: string;
		requester: string;
		songName: string;
	};
	googleSearches: {
		groupName: string;
		chatId: string;
		requester: string;
		query: string;
		type: string;
	};
	lyrics: {
		groupName: string;
		chatId: string;
		requester: string;
		query: string;
	};
	horoscope: {
		groupName: string;
		chatId: string;
		requester: string;
		sign: string;
	};
};

export enum EntityTypes {
	STICKERS = 'stickers',
	COPYPASTAS = 'copypastas',
	SONGS = 'songs',
	GOOGLESEARCHES = 'googleSearches',
	LYRICS = 'lyrics',
	HOROSCOPE = 'horoscope',
}

export default Database;
