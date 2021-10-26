import Genius, { Client } from 'genius-lyrics';

class LyricsApi {
	client: Client;

	constructor() {
		this.client = new Genius.Client();
	}

	async firstSong(query: string) {
		try {
			const result = await this.client.songs.search(query);
			return result[0].lyrics();
		} catch (e) {
			return undefined;
		}
	}
}

export default new LyricsApi();
