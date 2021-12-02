import fs from 'fs/promises';

export const getCopypstaList = () => {
	return fs.readdir('./media/Copypastas');
};

export const getCopyPastaByName = (copypastaName: string) => {
	return fs.readFile(`./media/Copypastas/${copypastaName}`, {
		encoding: 'utf-8',
	});
};

export const getCopyPastaByIndex = async (copypastaIndex: number) => {
	const copypastaList = await getCopypstaList();
	if (copypastaIndex + 1 > copypastaList.length) throw 'index out of bounds';

	return {
		copypasta: await getCopyPastaByName(copypastaList[copypastaIndex]),
		copypastaName: copypastaList[copypastaIndex],
	};
};

export const newCopyPasta = (copypastaName: string, copypasta: string) => {
	return fs.writeFile(`./media/Copypastas/${copypastaName}`, copypasta);
};

type CopypastaSearchResut = {
	copypasta: string;
	copypastaName: string;
};

export const getAllCopypastas = async (): Promise<CopypastaSearchResut[]> => {
	const copypastaList = await getCopypstaList();
	const results: Promise<CopypastaSearchResut>[] = [];

	return new Promise(resolve => {
		copypastaList.forEach(copypastaName => {
			results.push(
				getCopyPastaByName(copypastaName).then(copypasta => {
					return {
						copypasta,
						copypastaName,
					};
				})
			);
		});
		return resolve(Promise.all(results));
	});
};

export const searchCopyPasta = async (substring: string) => {
	const allCopypastas = await getAllCopypastas();
	return allCopypastas.filter(result => {
		return result.copypasta.toLowerCase().includes(substring.toLowerCase());
	});
};
