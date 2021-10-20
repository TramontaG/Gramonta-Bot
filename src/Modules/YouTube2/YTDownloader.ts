import ytdl, { chooseFormat, filterFormats } from 'ytdl-core';
import fsPromises from 'fs/promises';
import fs from 'fs';

class YTDownloader {
	downloadAudio(url: string, path: string) {
		return ytdl(url, {
			filter: format =>
				format.container === 'webm' &&
				format.audioCodec === 'opus' &&
				!format.videoCodec,
			quality: 'highestaudio',
		}).pipe(fs.createWriteStream(path));
	}

	getInfo(url: string) {
		return ytdl.getInfo(url).then(result => {
			return result.formats.filter(format => {
				return (
					!format.videoCodec &&
					format.audioCodec === 'opus' &&
					format.container === 'webm' &&
					(format.audioBitrate as number) >= 128
				);
			});
		});
	}
}

export default YTDownloader;
