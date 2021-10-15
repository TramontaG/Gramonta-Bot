import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import he from 'he';
import YTSearch from 'youtube-search';
import YoutubeMp3Downloader from 'youtube-mp3-downloader';

const downloaderOptions = {
	ffmpegPath: '/usr/bin/ffmpeg', // FFmpeg binary location
	outputPath: 'media/ytDownload', // Output file location (default: the home directory)
	youtubeVideoQuality: 'lowestaudio', // Desired video quality (default: highestaudio)
	queueParallelism: 3, // Download parallelism (default: 1)
	progressTimeout: 1000, // Interval in ms for the progress reports (default: 1000)
	allowWebm: true, // Enable download from WebM sources (default: false)
	outputOptions: [
		'-af',
		'silenceremove=1:0:-50dB',
		'-movflags',
		'frag_keyframe+empty_moov',
	], // Additional output options passend to ffmpeg
};

interface YoutubeArgs extends Args {
	results?: string;
	url?: string;
	index?: string;
}

interface CachedVideo {
	link: string;
	title: string;
	thumbnail?: string;
}

class Youtube extends Module {
	searchString: string;
	videos: CachedVideo[];
	nextPageToken: string;
	previousPageToken: string;
	requester: Message | null;
	alreadyDownloading: boolean;

	constructor() {
		super();

		this.searchString = '';
		this.videos = [];
		this.nextPageToken = '';
		this.previousPageToken = '';

		this.requester = null;
		this.alreadyDownloading = false;

		this.registerPublicMethod({
			name: 'default',
			method: this.askInfo.bind(this),
		});
		this.registerPublicMethod({
			name: 'help',
			method: this.help.bind(this),
		});
		this.registerPublicMethod({
			name: 'download',
			method: this.downloadVideo.bind(this),
		});
		this.registerPublicMethod({
			name: 'search',
			method: this.search.bind(this),
		});
		this.registerPublicMethod({
			name: 'next',
			method: this.next.bind(this),
		});
		this.registerPublicMethod({
			name: 'previous',
			method: this.previous.bind(this),
		});
	}

	async downloadVideo(args: YoutubeArgs) {
		try {
			const query = args.immediate;
			const { url, index } = args;
			if (index) return this.downloadByIndex(index);

			this.setRequester();
			if (url)
				return this.downloadVideoFromUrl(
					url,
					this.requester as Message
				);

			if (!query) return this.askInfo();
			const results = await this.searchResults(query);
			this.alreadyDownloading = true;

			this.sendVideoMetaData(results[0].title, results[0].thumbnail);

			return this.downloadVideoFromUrl(
				results[0].link,
				this.requester as Message
			);
		} catch (e) {
			this.sendErrorMessage('Deu pau', e as string);
		}
	}

	async search(args: YoutubeArgs, token?: string) {
		this.setRequester();
		if (!args.immediate && !this.searchString) return this.askInfo();
		const query = args.immediate || this.searchString;
		this.searchString = query;
		const results = await this.searchResults(query, token);
		this.videos = results;

		const message = results.reduce(
			(message: string, result, index) => {
				return (message += `${index + 1} - ${result.title}\n`);
			},
			''
		);

		const buttons = results.map((result, index) => ({
			id: `!yt download -index ${index}`,
			text: `Download  ${result.title}`,
		}));

		this.zaplify?.sendButtons(
			message,
			buttons,
			this.requester || undefined
		);
	}

	next(args: YoutubeArgs) {
		return this.search(args, this.nextPageToken);
	}
	previous(args: YoutubeArgs) {
		return this.search(args, this.previousPageToken);
	}

	private async downloadByIndex(stringIndex: string) {
		const index = Number(stringIndex);
		const choosenVideo = this.videos[index];

		await this.sendVideoMetaData(
			'Baixando ' + choosenVideo.title,
			choosenVideo.thumbnail
		);

		this.downloadVideoFromUrl(
			choosenVideo.link,
			this.requester as Message
		);
	}

	private async searchResults(
		query: string,
		token?: string,
		maxResults = 3
	) {
		console.log(token);
		const options = {
			maxResults,
			key: process.env.YOUTUBE_KEY,
			pageToken: token,
		};
		const response = await YTSearch(query, options);

		this.nextPageToken = response.pageInfo.nextPageToken;
		this.previousPageToken = response.pageInfo.prevPageToken;

		return response.results.map((result, index) => ({
			link: result.link,
			title: he.decode(result.title),
			thumbnail: result.thumbnails.high?.url,
		}));
	}

	private downloadVideoFromUrl(url: string, requester: Message) {
		const YD = new YoutubeMp3Downloader(downloaderOptions);
		const ID_VIDEO = url.split('=')[1];
		YD.download(ID_VIDEO);

		YD.on('finished', (err, data) =>
			this.sendVideo(err, data, requester)
		);
		YD.on('error', err =>
			this.sendErrorMessage('Erro ao baixar mp3', err)
		);
		YD.on('progress', info => console.log(info.progress));
	}

	private async sendVideo(err: any, data: any, message: Message) {
		console.log(data);
		const videoSent = await this.zaplify?.sendFile(
			data.file,
			'',
			message
		);
		this.alreadyDownloading = false;
	}

	private askInfo() {
		this.zaplify?.replyAuthor(
			'Preciso de mais informações. Se quiser saber como funciono, digite !yt ajuda',
			this.requester || undefined
		);
	}

	private sendErrorMessage(prefix: string, error: string) {
		this.zaplify?.replyAuthor(`${prefix}: ${error}`);
	}

	private sendVideoMetaData(title: string, thumbnail?: string) {
		console.log(title, thumbnail);
		if (thumbnail)
			return this.zaplify?.sendImageFromUrl(
				thumbnail,
				title,
				this.requester || undefined
			);
		else
			return this.zaplify?.sendMessage(
				`Baixando mp3 do vídeo:\n${title}`,
				this.requester || undefined
			);
	}

	private setRequester() {
		this.requester = this.zaplify?.messageObject as Message;
		console.log(this.requester.id);
	}

	async help() {
		const helpText = await fs.readFile(
			'src/Modules/Youtube/Help.txt',
			{ encoding: 'utf-8' }
		);
		this.zaplify?.replyAuthor(helpText);
	}
}

export default new Youtube();
