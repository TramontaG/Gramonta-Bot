import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import he from 'he';
import YTSearch from 'youtube-search';
import YoutubeMp3Downloader from 'youtube-mp3-downloader';
import API from '../Lyrics/API,';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';

const downloaderOptions = {
	filter: 'audioonly',
	ffmpegPath: 'C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffmpeg', // FFmpeg binary location
	outputPath: 'media/ytDownload', // Output file location (default: the home directory)
	youtubeVideoQuality: 'highestaudio', // Desired video quality (default: highestaudio)
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
	req?: string;
}

interface CachedVideo {
	requester: string;
	videos: {
		link: string;
		title: string;
		thumbnail?: string;
	}[];
}

interface VideoInProgress {
	title: string;
	progress: number;
	eta: number;
	videoId: string;
}

class Youtube extends Module {
	searchString: string;
	videos: CachedVideo[];
	nextPageToken: string;
	previousPageToken: string;
	requester: Message | null;
	requesterLine: Message[];
	videosInProgress: VideoInProgress[];
	logger: Logger;

	constructor() {
		super();

		this.searchString = '';
		this.videos = [];
		this.nextPageToken = '';
		this.previousPageToken = '';

		this.requester = null;
		this.requesterLine = [];

		this.videosInProgress = [];

		this.logger = new Logger();

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
		this.registerPublicMethod({
			name: 'progress',
			method: () => this.progress(),
		});
	}

	progress(requester?: Message) {
		let replyString = `*_Videos sendo baixados atualmente pelo bot_*\n\n`;
		replyString += this.videosInProgress.reduce(
			(reply: string, video: VideoInProgress) => {
				reply += `*${video.title}* - ${video.progress.toFixed(2)}% concluidos.\n`;
				reply += `Tempo estimado de espera: ${video.eta.toFixed(0)} segundos\n\n`;
				return reply;
			},
			``
		);
		this.zaplify?.replyAuthor(replyString, requester);
	}

	async downloadVideo(args: YoutubeArgs) {
		try {
			const requester = this.requester as Message;
			const query = args.immediate;
			const { url, index, req } = args;
			if (index) return this.downloadByIndex(index, req);

			if (url) return this.downloadVideoFromUrl(url, this.requester as Message, url);

			if (!query) return this.askInfo();
			const results = await this.searchResults(query);
			if (!results) return;

			this.sendVideoMetaData(results[0].title, results[0].thumbnail);

			this.downloadVideoFromUrl(
				results[0].link,
				this.requester as Message,
				results[0].title
			);
			setTimeout(() => this.progress(requester), 3000);
		} catch (e) {
			this.sendErrorMessage('Deu pau', e as string);
		}
	}

	async search(args: YoutubeArgs, token?: string) {
		if (!args.immediate && !this.searchString) return this.askInfo();
		const query = args.immediate || this.searchString;
		this.searchString = query;

		this.addRequester(this.requester as Message);

		const results = await this.searchResults(query, token);
		if (!results) return;
		this.addVideos(results);

		const message = results.reduce((message: string, result, index) => {
			return (message += `${index + 1} - ${result.title}\n`);
		}, '');

		const buttons = results.map((result, index) => ({
			id: `!yt download -index ${index} -req ${this.requester?.id}`,
			text: `${result.title}`,
		}));

		this.zaplify?.sendButtons(message, buttons, this.requester || undefined);
	}

	next(args: YoutubeArgs) {
		return this.search(args, this.nextPageToken);
	}
	previous(args: YoutubeArgs) {
		return this.search(args, this.previousPageToken);
	}

	private async downloadByIndex(stringIndex: string, reqId?: string) {
		const index = Number(stringIndex);
		const requester = this.requesterLine.filter(
			request => request.id.toLowerCase() === reqId
		)[0];
		const requesterVideoArray = this.videos.filter(
			video => video.requester.toLowerCase() === reqId
		)[0];
		const choosenVideo = requesterVideoArray?.videos[index];

		await this.sendVideoMetaData(
			'Baixando ' + choosenVideo.title,
			choosenVideo.thumbnail
		);

		return this.downloadVideoFromUrl(
			choosenVideo.link,
			requester as Message,
			choosenVideo.title
		);
	}

	private async searchResults(query: string, token?: string, maxResults = 3) {
		try {
			const options = {
				maxResults,
				key: process.env.YOUTUBE_KEY,
				pageToken: token,
			};
			const response = await YTSearch(query, options);

			this.nextPageToken = response.pageInfo.nextPageToken;
			this.previousPageToken = response.pageInfo.prevPageToken;

			return response.results
				.filter(result => result.kind === 'youtube#video')
				.map((result, index) => ({
					link: result.link,
					title: he.decode(result.title),
					thumbnail: result.thumbnails.high?.url,
				}));
		} catch (e) {
			return this.sendErrorMessage('Erro desconhecido', JSON.stringify(e));
		}
	}

	private downloadVideoFromUrl(url: string, requester: Message, title: string) {
		try {
			const YD = new YoutubeMp3Downloader(downloaderOptions);
			const ID_VIDEO = url.split('=')[1];

			this.logger.insertNew(EntityTypes.SONGS, {
				groupName: requester.isGroupMsg ? requester.chat.name : '_',
				chatId: requester.chat.id,
				requester: requester.sender.formattedName,
				songName: title,
				date: new Date().getTime(),
			});

			YD.download(ID_VIDEO);
			this.videosInProgress.push({
				title,
				eta: NaN,
				progress: 0,
				videoId: ID_VIDEO,
			});
			YD.on('finished', async (err, data) => {
				const videoInProgressIndex = this.videosInProgress.indexOf(
					this.videosInProgress.filter(video => video.videoId === ID_VIDEO)[0]
				);
				this.videosInProgress.splice(videoInProgressIndex, 1);
				this.sendVideo(data, requester);

				const lyrics = await API.firstSong(title);
				if (!lyrics) return;
				this.zaplify?.replyAuthor(lyrics, requester);
			});
			YD.on('error', err => {
				const videoInProgressIndex = this.videosInProgress.indexOf(
					this.videosInProgress.filter(video => video.videoId === ID_VIDEO)[0]
				);
				this.videosInProgress.splice(videoInProgressIndex, 1);
				this.sendErrorMessage('Erro ao baixar mp3', err);
			});
			YD.on('progress', info => {
				const video = this.videosInProgress.filter(
					video => video.videoId === ID_VIDEO
				)[0];
				video.eta = info.progress.eta;
				video.progress = info.progress.percentage;
			});
		} catch (e) {
			this.sendErrorMessage('Erro desconhecido', JSON.stringify(e));
		}
	}

	private async sendVideo(data: any, message: Message) {
		this.zaplify?.sendFile(data.file, '', message);
	}

	private askInfo() {
		this.zaplify?.replyAuthor(
			'Preciso de mais informações. Se quiser saber como funciono, digite !yt help',
			this.requester || undefined
		);
	}

	private sendErrorMessage(prefix: string, error: string) {
		this.zaplify?.replyAuthor(`${prefix}: ${error}`, this.requester || undefined);
	}

	private sendVideoMetaData(title: string, thumbnail?: string) {
		if (thumbnail)
			return this.zaplify?.sendImageFromUrl(
				thumbnail,
				`Baixando mp3 do vídeo:\n${title}`,
				this.requester || undefined
			);
		else
			return this.zaplify?.sendMessage(
				`Baixando mp3 do vídeo:\n${title}`,
				this.requester || undefined
			);
	}

	private addRequester(requester: Message) {
		this.requesterLine.unshift(requester);
		if (this.requesterLine.length > 5) this.requesterLine.pop();
	}

	private addVideos(
		results: {
			link: string;
			title: string;
			thumbnail?: string;
		}[]
	) {
		this.videos.unshift({
			requester: this.requester?.id as string,
			videos: results,
		});
		if (this.videos.length > 5) this.videos.pop();
	}

	async help() {
		const helpText = await fs.readFile('src/Modules/Youtube/Help.txt', {
			encoding: 'utf-8',
		});
		this.zaplify?.replyAuthor(helpText);
	}
}

export default new Youtube();
