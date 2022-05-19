import Realm from 'realm';

class Database {
	DatabaseVersion: number;
	_RealmInstance: Realm | undefined;
	constructor() {
		this.DatabaseVersion = 8;
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
				date: 'int',
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
				values: 'string[]',
				date: 'int',
			},
		},
		wordle: {
			name: 'wordle',
			primaryKey: 'id',
			properties: {
				id: { type: 'int', indexed: true },
				groupName: 'string',
				chatId: 'string',
				requester: 'string',
				state: 'string',
				tries: 'int',
				gameID: 'string',
				date: 'int',
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
		date: number;
	};
	finance: {
		groupName: string;
		chatId: string;
		requester: string;
		operation: string;
		values: string[];
		date: number;
	};
	wordle: {
		groupName: string;
		chatId: string;
		requester: string;
		date: number;
		state: WordleState;
		tries: number;
		gameID: string;
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
	FINANCE = 'finance',
	WORDLE = 'wordle',
}

export type WithID<T extends keyof AllEntitiesModel> = {
	id: number;
} & AllEntitiesModel[T];

export type WordleState = 'start' | 'lose' | 'win';

export default Database;
