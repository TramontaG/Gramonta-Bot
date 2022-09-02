import ModulesWrapper from '../../ModulesRegister';
import Help from '../../Help';
import About from '../../About';

import Sticker from '../../Sticker';
import Youtube from '../../Youtube';
import Horoscopo from '../../Horoscopo';
import Google from '../../Google';
import Transcribe from '../../Transcribe';
import LyricsFinder from '../../Lyrics';
import CopypastaManager from '../../Copypasta';
import Logger from '../../Logger';
import Weather from '../../Weather';
import Meme from '../../MemeMaker';
import TextTransform from '../../TextTransform';
import Finance from '../../Finance';
import Ping from '../../Ping';
import Dictionary from '../../Dictionary';
import Translate from '../../Translate';
import OpenAI from '../../OpenAi';
import Downloader from '../../Downloader';

import { kudurolify } from '../../TextTransform/Transformations';
import Wordle from '../..//Wordle';

const modulesWrapper = new ModulesWrapper();

const help = new Help();
const sticker = new Sticker();
const youtube = new Youtube();
const horoscope = new Horoscopo();
const dictionary = new Dictionary;

modulesWrapper.registerModule('help', help);
modulesWrapper.registerModule('menu', help);
modulesWrapper.registerModule('about', new About());

modulesWrapper.registerModule('sticker', sticker);
modulesWrapper.registerModule('s', sticker);
modulesWrapper.registerModule('yt', youtube);
modulesWrapper.registerModule('youtube', youtube);
modulesWrapper.registerModule('horoscopo', horoscope);
modulesWrapper.registerModule('horóscopo', horoscope);
modulesWrapper.registerModule('google', new Google());
// modulesWrapper.registerModule('yt2', Youtube2);
modulesWrapper.registerModule('transcribe', new Transcribe());
modulesWrapper.registerModule('lyrics', new LyricsFinder());
modulesWrapper.registerModule('copypasta', new CopypastaManager());
modulesWrapper.registerModule('log', new Logger());
modulesWrapper.registerModule('weather', new Weather());
modulesWrapper.registerModule('meme', new Meme());
modulesWrapper.registerModule('kuduro', new TextTransform(kudurolify));
modulesWrapper.registerModule('finance', new Finance());
modulesWrapper.registerModule('wordle', new Wordle());
modulesWrapper.registerModule("translate", new Translate());
modulesWrapper.registerModule("ping", new Ping());
modulesWrapper.registerModule("dicionario", dictionary);
modulesWrapper.registerModule("significado", dictionary);
modulesWrapper.registerModule("openai", new OpenAI());
modulesWrapper.registerModule('download', new Downloader());

export default modulesWrapper;
