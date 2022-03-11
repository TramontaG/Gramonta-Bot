import ModulesWrapper from './ModulesRegister';
import Help from './Help';
import About from './About';

import Sticker from './Sticker';
import Youtube from './Youtube';
import Youtube2 from './YouTube2';
import Horoscopo from './Horoscopo';
import Google from './Google';
import Transcribe from './Transcribe';
import LyricsFinder from './Lyrics';
import CopypastaManager from './Copypasta';
import Logger from './Logger';
import Weather from './Weather';
import Meme from './MemeMaker';
import TextTransform from './TextTransform';
import Finance from './Finance';

const modulesWrapper = new ModulesWrapper();

modulesWrapper.registerModule('help', Help);
modulesWrapper.registerModule('menu', Help);
modulesWrapper.registerModule('about', About);

modulesWrapper.registerModule('sticker', Sticker);
modulesWrapper.registerModule('s', Sticker);
modulesWrapper.registerModule('yt', Youtube);
modulesWrapper.registerModule('youtube', Youtube);
modulesWrapper.registerModule('horoscopo', Horoscopo);
modulesWrapper.registerModule('horóscopo', Horoscopo);
modulesWrapper.registerModule('google', Google);
modulesWrapper.registerModule('yt2', Youtube2);
modulesWrapper.registerModule('transcribe', Transcribe);
modulesWrapper.registerModule('lyrics', LyricsFinder);
modulesWrapper.registerModule('copypasta', CopypastaManager);
modulesWrapper.registerModule('log', Logger);
modulesWrapper.registerModule('weather', Weather);
modulesWrapper.registerModule('meme', Meme);
modulesWrapper.registerModule('text', TextTransform);
modulesWrapper.registerModule('finance', Finance);

export default modulesWrapper;
