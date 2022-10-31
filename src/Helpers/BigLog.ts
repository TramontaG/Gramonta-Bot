import fs from 'fs/promises';

export default (obj: Object) => {
    return fs.writeFile("./bigLog.json", JSON.stringify(obj, null, "  "));
}
