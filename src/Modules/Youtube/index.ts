import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';
import he from 'he';
import YTSearch from 'youtube-search';
import YoutubeMp3Downloader from 'youtube-mp3-downloader';
import API from '../Lyrics/API,';
import Logger from '../Logger/Logger';
import { EntityTypes } from 'src/BigData/JsonDB';
import YouTubeDownloader from 'ytdl-core';
import BigLog from 'src/Helpers/BigLog';
import axios from 'axios';

const downloaderOptions = {
	filter: 'audioonly',
	ffmpegPath: '/usr/bin/ffmpeg', // FFmpeg binary location
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
	videos: CachedVideo[];
	requesterLine: Message[];
	videosInProgress: VideoInProgress[];
	logger: Logger;

	constructor() {
		super();
		this.videos = [];

		this.requesterLine = [];

		this.videosInProgress = [];

		this.logger = new Logger();

		this.registerPublicMethod({
			name: 'default',
			method: this.askInfo.bind(this),
		});

		this.registerPublicMethod({
			name: 'download',
			method: this.downloadSong.bind(this),
		});

		this.registerPublicMethod({
			name: 'video',
			method: this.downloadVideo.bind(this),
		});
	}

	async downloadVideo(args: YoutubeArgs, requester: Message) {
		try {
			const query = args.immediate;
			if (!query) return this.askInfo(args, requester);

			const results = await this.searchResults(query);
			if (!results) return;

			const firstVideo = results[0];

			const downloadStream = YouTubeDownloader(firstVideo.link, {
				filter: format =>
					Number(format.contentLength) < 15700000 && format.container === 'mp4',
			});

			let video = Buffer.from('');

			downloadStream.on('data', chunk => {
				video += chunk;
			});

			downloadStream.on('end', async () => {
				const filePath = './media/ytVideos/' + results[0].title + '.mp4';
				await fs.writeFile(filePath, video);
				console.log('FINISHED');
				this.zaplify?.sendFileFromPath(filePath, 'video/mp4', requester);
			});
		} catch (e) {
			console.warn(e);
			this.zaplify?.replyAuthor(JSON.stringify(e), requester);
		}
	}

	async downloadSong(args: YoutubeArgs, requester: Message) {
		try {
			const query = args.command + args.immediate;
			if (!query) return this.askInfo(args, requester);

			const results = await this.searchResults(query);
			if (!results) return;

			this.sendVideoMetaData(results[0].title, results[0].thumbnail, requester);

			this.downloadVideoFromUrl(
				results[0].link,
				requester as Message,
				results[0].title
			);
		} catch (e) {
			this.sendErrorMessage('Deu pau', e as string);
		}
	}

	private async searchResults(
		query: string,
		token?: string,
		maxResults = 3,
		requester?: Message
	) {
		try {
			const options = {
				maxResults,
				key: process.env.YOUTUBE_KEY,
				pageToken: token,
			};
			const response = await YTSearch(query, options);
			console.log({
				results: response.results,
			});

			return response.results
				.filter(result => result.kind === 'youtube#video')
				.map((result, index) => ({
					link: result.link,
					title: he.decode(result.title),
					thumbnail: result.thumbnails.high?.url,
				}));
		} catch (e) {
			return this.sendErrorMessage(
				'Erro desconhecido',
				JSON.stringify(e),
				requester
			);
		}
	}

	private downloadVideoFromUrl(url: string, requester: Message, title: string) {
		try {
			const YD = new YoutubeMp3Downloader(downloaderOptions);
			const ID_VIDEO = url.split('=')[1];

			this.logger.insertNew(EntityTypes.SONGS, {
				groupName: requester.isGroupMsg ? requester.chat.name : '_',
				chatId: requester?.chat?.id || 'unknown',
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
				if (err)
					return this.zaplify?.replyAuthor(
						'Deu pau, se liga: ' + JSON.stringify(err),
						requester
					);

				const videoInProgressIndex = this.videosInProgress.indexOf(
					this.videosInProgress.filter(video => video.videoId === ID_VIDEO)[0]
				);
				this.videosInProgress.splice(videoInProgressIndex, 1);
				this.sendVideo(data, requester);

				try {
					const lyrics = await API.firstSong(title);
					if (!lyrics) return;
					this.zaplify?.replyAuthor(lyrics, requester);
				} catch (e) {
					return;
				}
			});
			YD.on('error', err => {
				const videoInProgressIndex = this.videosInProgress.indexOf(
					this.videosInProgress.filter(video => video.videoId === ID_VIDEO)[0]
				);
				this.videosInProgress.splice(videoInProgressIndex, 1);
				this.sendErrorMessage('Erro ao baixar mp3', err, requester);
			});
		} catch (e) {
			console.warn(e);
			this.sendErrorMessage('Erro desconhecido', JSON.stringify(e), requester);
		}
	}

	private async sendVideo(data: any, message: Message) {
		console.log(data);
		try {
			this.zaplify?.sendSong('./' + data.file, '', message);
		} catch (e) {
			this.zaplify?.replyAuthor('deu ruim', message);
		}
	}

	async askInfo(args: Args, requester: Message) {
		const helpText = await fs.readFile('src/Modules/Youtube/Help.txt', {
			encoding: 'utf-8',
		});
		return this.zaplify?.replyAuthor(helpText, requester);
	}

	private sendErrorMessage(prefix: string, error: string, requester?: Message) {
		this.zaplify?.replyAuthor(`${prefix}: ${error}`, requester);
	}

	private sendVideoMetaData(title: string, thumbnail?: string, requester?: Message) {
		if (thumbnail)
			return this.zaplify?.sendImageFromUrl(
				thumbnail,
				`Baixando mp3 do vídeo:\n${title}`,
				requester
			);
		else
			return this.zaplify?.sendMessage(
				`Baixando mp3 do vídeo:\n${title}`,
				requester
			);
	}
}

export default Youtube;
