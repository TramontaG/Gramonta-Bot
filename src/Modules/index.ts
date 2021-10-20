import ModulesWrapper from './ModulesRegister';
import Sticker from './Sticker';
import Youtube from './Youtube';
import Youtube2 from './YouTube2';
import Horoscopo from './Horoscopo';
import Google from './Google';
import Help from './Help';

const modulesWrapper = new ModulesWrapper();

modulesWrapper.registerModule('sticker', Sticker);
modulesWrapper.registerModule('s', Sticker);
modulesWrapper.registerModule('yt', Youtube);
modulesWrapper.registerModule('youtube', Youtube);
modulesWrapper.registerModule('horoscopo', Horoscopo);
modulesWrapper.registerModule('horóscopo', Horoscopo);
modulesWrapper.registerModule('google', Google);
modulesWrapper.registerModule('help', Help);
modulesWrapper.registerModule('yt2', Youtube2);

export default modulesWrapper;
