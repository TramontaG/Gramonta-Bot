import fs from 'fs/promises';

export const getCopypstaList = () => {
	return fs.readdir('./media/Copypastas');
};

export const getCopyPasta = (copypastaName: string) => {
	return fs.readFile(`./media/Copypastas/${copypastaName}`, {
		encoding: 'utf-8',
	});
};

export const newCopyPasta = (copypastaName: string, copypasta: string) => {
	return fs.writeFile(`./media/Copypastas/${copypastaName}`, copypasta);
};
