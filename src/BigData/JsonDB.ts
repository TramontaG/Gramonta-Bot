import Realm from 'realm';

class Database {
	DatabaseVersion: number;
	_RealmInstance: Realm | undefined;
	constructor() {
		this.DatabaseVersion = 6;
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
				date: 'int',
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
				date: 'int',
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
				date: 'int',
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
				date: 'int',
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
				date: 'int',
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
				date: 'int',
			},
		},
		weather: {
			name: 'weather',
			primaryKey: 'id',
			properties: {
				id: { type: 'int', indexed: true },
				groupName: 'string',
				chatId: 'string',
				requester: 'string',
				query: 'string',
				date: 'int',
			},
		},
		meme: {
			name: 'meme',
			primaryKey: 'id',
			properties: {
				id: { type: 'int', indexed: true },
				groupName: 'string',
				chatId: 'string',
				requester: 'string',
				memeId: 'string',
				date: 'string',
			},
		},
		finance: {
			name: 'finance',
			primaryKey: 'id',
			properties: {
				id: { type: 'int', indexed: true },
				groupName: 'string',
				chatId: 'string',
				requester: 'string',
				operation: 'string',
				test: 'salve fatec!!',
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
		date: number;
	};
	stickers: {
		groupName: string;
		chatId: string;
		requester: string;
		animated: boolean;
		date: number;
	};
	songs: {
		groupName: string;
		chatId: string;
		requester: string;
		songName: string;
		date: number;
	};
	googleSearches: {
		groupName: string;
		chatId: string;
		requester: string;
		query: string;
		type: string;
		date: number;
	};
	lyrics: {
		groupName: string;
		chatId: string;
		requester: string;
		query: string;
		date: number;
	};
	horoscope: {
		groupName: string;
		chatId: string;
		requester: string;
		sign: string;
		date: number;
	};
	weather: {
		groupName: string;
		chatId: string;
		requester: string;
		query: string;
		date: number;
	};
	meme: {
		groupName: string;
		chatId: string;
		requester: string;
		memeId: string;
		date: string;
	};
};

export enum EntityTypes {
	STICKERS = 'stickers',
	COPYPASTAS = 'copypastas',
	SONGS = 'songs',
	GOOGLESEARCHES = 'googleSearches',
	LYRICS = 'lyrics',
	HOROSCOPE = 'horoscope',
	WEATHER = 'weather',
	MEME = 'meme',
}

export default Database;
