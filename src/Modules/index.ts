import ModulesWrapper from './ModulesRegister';
import Sticker from './Sticker';
import Youtube from './Youtube';

const modulesWrapper = new ModulesWrapper();

modulesWrapper.registerModule('sticker', Sticker);
modulesWrapper.registerModule('yt', Youtube);

export default modulesWrapper;
