import ytdl from 'ytdl-core';
import fs from 'fs';
import YTSearch, { YouTubeSearchOptions } from 'youtube-search';
import he from 'he';

type DownloadType = 'video' | 'audio';

/**
 * Downloads mp3 from a youtube video
 * @param {string} id
 * @returns {string} mp3 path
 */
export const downloadMp3FromId = async (id: string): Promise<string> => {
	const path = './media/ytDownload/song.webm';
	const ytUrl = `https://www.youtube.com/watch?v=${id}`;

	return downloadMp3FromUrl(ytUrl, path);
};

/**
 * Downloads mp3 from a youtube url
 * @param url
 * @param savePath
 * @returns {string} mp3 path
 */
export const downloadMp3FromUrl = (
	url: string,
	savePath: string
): Promise<string> => {
	return ytDownload('audio', url, savePath);
};

/**
 * Downloads mp4 from a youtube url
 * @param {string} id
 * @param savePath
 * @returns {string} mp4 path
 */
export const downloadVideoFromId = (id: string): Promise<string> => {
	const path = './media/ytVideos/video.mp4';
	const ytUrl = `https://www.youtube.com/watch?v=${id}`;
	return ytDownload('video', ytUrl, path);
};

/**
 * Downloads mp4 from a youtube url
 * @param url
 * @param savePath
 * @returns {string} mp4 path
 */
export const downloadVideoFromUrl = (
	url: string,
	savePath: string
): Promise<string> => {
	return ytDownload('video', url, savePath);
};

/**
 * Downloads video or audio from youtube
 * @param {DownloadType} type
 * @param {string} url
 * @param {string} savePath
 * @returns {string} mp3 path
 */
const ytDownload = (
	type: DownloadType,
	url: string,
	savePath: string
): Promise<string> => {
	const quality = type === 'video' ? '18' : 'highestaudio';

	return new Promise((resolve, reject) => {
		const download = ytdl(url, {
			quality,
		}).pipe(fs.createWriteStream(savePath));

		download.once('close', () => {
			resolve(savePath);
		});

		download.once('error', err => {
			reject(err);
		});
	});
};

export const searchResults = async (
	query: string,
	token?: string,
	maxResults = 3
) => {
	try {
		const options: YouTubeSearchOptions = {
			maxResults,
			key: process.env.YOUTUBE_KEY,
			pageToken: token,
		};
		const response = await YTSearch(query, options);

		return {
			...response,
			results: response.results
				.filter(result => result.kind === 'youtube#video')
				.map((result, index) => ({
					link: result.link,
					title: he.decode(result.title),
					thumbnail: result.thumbnails.high?.url,
				})),
		};
	} catch (e) {
		return undefined;
	}
};
