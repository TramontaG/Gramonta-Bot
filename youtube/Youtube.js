const YTSearch = require('youtube-search');
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const downloaderOptions = {
    "ffmpegPath": "/usr/bin/ffmpeg",        // FFmpeg binary location
    "outputPath": "./media",         // Output file location (default: the home directory)
    "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
    "queueParallelism": 3,                  // Download parallelism (default: 1)
    "progressTimeout": 1000,                // Interval in ms for the progress reports (default: 1000)
    "allowWebm": true,                      // Enable download from WebM sources (default: false)
    "outputOptions": ["-af", "silenceremove=1:0:-50dB", '-movflags', 'frag_keyframe+empty_moov'], // Additional output options passend to ffmpeg
    "youtubeVideoQuality": 'lowest'
}

class YoutubeDownloader {
    constructor(key) {
        this.key = key;
        this.searchString = '';
        this.nextPageToken = '';
        this.previousPageToken = '';
        this.videos = [];
    }

    getNextPage(){
        return this.getResults(this.searchString, this.nextPageToken);
    }
    getPreviousPage(){
        return this.getResults(this.searchString, this.previousPageToken);
    }
    getCachedResults(){
        return this.videos;
    }

    async getResults(searchString, pageToken, maxResults = 5){
        const options = { maxResults, key: this.key, pageToken };
        const response = await YTSearch(searchString, options);
    
        this.searchString = searchString;
        this.videos = response.results;
        this.nextPageToken = response?.pageInfo.nextPageToken;
        this.previousPageToken = response?.pageInfo.prevPageToken;

        return response.results.map((result, index) => ({
            link: result.link,
            title: result.title,
            index, 
        }));
    }

    async downloadVideoFromUrl(videoUrl, options = {}){
        try {
            const YD = new YoutubeMp3Downloader(downloaderOptions);
            const ID_VIDEO = videoUrl.split('=')[1];

            console.log("BAIXANDO VIDEO DE ID = ", ID_VIDEO);
            
            YD.download(ID_VIDEO);
            options.onStart?.();
    
            //precisa ser uma função. Se não existir função na options.onProgress, ele
            //passa uma função vazia :)
            YD.on("progress", options.onProgress || (() => {}));
            YD.on("finished", options.onFinished || (() => {}));
    
            YD.on("error", options.onError || ((error) => {
                throw error;
            }));
    
    
            return `Achei teu video, to baixando já`;
        } catch (e) {
            return "deu merda, se liga: " + e;
        }
    }

    async downloadFirstResult(searchString, options){
        const response = await this.getResults(searchString);
        return this.downloadVideoFromUrl(response[0].link, options);
    }

    async downloadFromIndex(index, options){
        console.log(this.videos);
        const safeIndex = parseInt(index);
        return this.downloadVideoFromUrl(this.videos[safeIndex -1].link, options);
    }
}



module.exports = YoutubeDownloader;