import ModulesWrapper from './ModulesRegister';
import Sticker from './Sticker';
import Youtube from './Youtube';
import Horoscopo from './Horoscopo';
import Google from './Google';

const modulesWrapper = new ModulesWrapper();

modulesWrapper.registerModule('sticker', Sticker);
modulesWrapper.registerModule('s', Sticker);
modulesWrapper.registerModule('yt', Youtube);
modulesWrapper.registerModule('youtube', Youtube);
modulesWrapper.registerModule('horoscopo', Horoscopo);
modulesWrapper.registerModule('horóscopo', Horoscopo);
modulesWrapper.registerModule('google', Google);

export default modulesWrapper;
