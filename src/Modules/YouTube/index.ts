import { Message } from '@open-wa/wa-automate';
import { Button } from '@open-wa/wa-automate/dist/api/model/button';
import { Args, Module } from '../ModulesRegister';
import {
	downloadMp3FromId,
	downloadVideoFromId,
	searchResults,
} from './YTDownloader';

interface SearchArgs extends Args {
	token?: string;
	currPage?: string;
}

interface AskArgs extends Args {}
interface DownloadFromIdArgs extends Args {}

type SearchType = 'search' | 'search-song' | 'search-video';

class YouTube extends Module {
	constructor() {
		super();
		this.makePublic('search', this.search('search'));
		this.makePublic('search-song', this.search('search-song'));
		this.makePublic('search-video', this.search('search-video'));
		this.makePublic('ask', this.ask);
		this.makePublic('mp3-from-id', this.sendFromId(downloadMp3FromId));
		this.makePublic('mp4-from-id', this.sendFromId(downloadVideoFromId));
		this.makePublic('first-song', this.first(downloadMp3FromId, 'song'));
		this.makePublic('first-video', this.first(downloadVideoFromId, 'video'));
		this.makePublic('help', this.help);
		this.makePublic('default', this.help);

		this.messagesPath = './src/Modules/YouTube/messages.zap.md';
	}

	search(searchType: SearchType) {
		return async (args: SearchArgs, requester: Message) => {
			const query = args.immediate;
			const { token = '', currPage = '1' } = args;

			if (!query) {
				return this.sendMessageFromTemplate('BadQuery', requester);
			}

			const response = await searchResults(query, token.toUpperCase());
			if (!response) {
				return this.sendMessageFromTemplate('EmptySearchResult', requester);
			}

			const command = (() => {
				if (searchType === 'search') return 'ask';
				if (searchType === 'search-song') return 'mp3-from-id';
				if (searchType === 'search-video') return 'mp4-from-id';
			})();

			const resultsButtons: Button[] = response?.results.map(result => ({
				id: `!yt ${command} ${this.extractIdFromUrl(result.link)}`,
				text: result.title,
			}));

			await this.zaplify.sendButtons('Resultados:', resultsButtons, requester);
			await this.zaplify.sendButtons(
				'Navegação:',
				this.getNavigationButtons(searchType, query, response, currPage),
				requester
			);
		};
	}

	async ask(args: AskArgs, requester: Message) {
		try {
			const id = args.immediate;

			if (!id) {
				return this.sendMessageFromTemplate('Error', requester);
			}

			await this.zaplify.sendButtons(
				'Escolha o formato que deseja baixar:',
				this.getDownloadButtons(id),
				requester
			);
		} catch (e) {
			this.sendMessageFromTemplate('Error', requester, {
				error: 'Error while trying to send buttons: ' + e,
			});
		}
	}

	first(fn: (id: string) => Promise<string>, type: 'song' | 'video') {
		return async (args: Args, requester: Message) => {
			const query = args.immediate;
			if (!query) {
				return this.sendMessageFromTemplate('BadQuery', requester);
			}
			const response = await searchResults(query);
			if (!response) {
				return this.sendMessageFromTemplate('EmptySearchResult', requester);
			}

			const path = await fn(this.extractIdFromUrl(response.results[0].link));

			if (type === 'song') {
				return this.zaplify.sendSong(path, requester);
			} else {
				return this.zaplify.sendFile(path, '', requester);
			}
		};
	}

	sendFromId(fn: (id: string) => Promise<string>) {
		return async (args: DownloadFromIdArgs, requester: Message) => {
			try {
				const id = args.immediate;

				if (!id) {
					return this.sendMessageFromTemplate('Error', requester, {
						error: 'Empty ID',
					});
				}

				const path = await fn(id);
				if (path.endsWith('webm')) {
					return this.zaplify.sendSong(path, requester);
				} else {
					return this.zaplify.sendFile(path, '', requester);
				}
			} catch (e) {
				return this.sendMessageFromTemplate('Error', requester, {
					error: 'Unable to send file:' + e,
				});
			}
		};
	}

	help(args: Args, requester: Message) {
		return this.sendMessageFromTemplate('help', requester);
	}

	private extractIdFromUrl = (url: string) => {
		return url.split('=')[1];
	};

	private getNavigationButtons(
		search: SearchType,
		query: string,
		response: Awaited<ReturnType<typeof searchResults>>,
		currPage: string
	) {
		const nextPage = {
			id: `!yt ${search} ${query} -token ${response!.pageInfo.nextPageToken} -page ${
				Number(currPage) + 1
			}`,
			text: 'Proxima página',
		};

		const prevPage = {
			id: `!yt search ${query} -token ${response!.pageInfo.prevPageToken} -page ${
				Number(currPage) - 1
			}`,
			text: 'Página anterior página',
		};

		if (Number(currPage) > 1) {
			return [prevPage, nextPage];
		}
		return [nextPage];
	}

	private getDownloadButtons(id: string): Button[] {
		return [
			{
				text: 'Audio',
				id: `!yt mp3-from-id ${id}`,
			},
			{
				text: 'Video',
				id: `!yt mp4-from-id ${id}`,
			},
		];
	}
}

export default YouTube;
