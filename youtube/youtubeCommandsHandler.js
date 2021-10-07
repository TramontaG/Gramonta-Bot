const YoutubeDownloader = require('./Youtube');
const key = 'AIzaSyARsUt7mpnrM__x-uA95qkKAArXop6j2Bo'
const YTD = new YoutubeDownloader(key);

const inputHandler = {}

inputHandler['-download'] = async (args, options) => {
   try {
        const result = await YTD.downloadFirstResult(args, options);
        return {
            responseType: "Download",
            data: result,
        }
   }catch (e) {
       throw e;
   }
};

inputHandler['-search'] = async (searchString) => {

    const result = await YTD.getResults(searchString);
    return {
        responseType: "Search",
        data: result,
    }
};

inputHandler['-index'] = async (index, options) => {
    const result = await YTD.downloadFromIndex(index, options);
    return {
        responseType: "Download",
        data: result,
    }
};

inputHandler['-next'] = async () => {
    const result = await YTD.getNextPage();
    return {
        responseType: "Search",
        data: result,
    }
};

inputHandler['-previous'] = async () => {
    const result = await YTD.getPreviousPage();
    return {
        responseType: "Search",
        data: result,
    }
};

inputHandler['default'] = async () => {throw "invalid method"};

module.exports = inputHandler;