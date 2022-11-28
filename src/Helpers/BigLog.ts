import fs from 'fs/promises';
import { inspect } from 'util';

export const deepLog = (obj: object) => console.log(inspect(obj, true, null, true));

export default (obj: Object) => {
	return fs.writeFile('./bigLog.json', JSON.stringify(obj, null, '  '));
};
