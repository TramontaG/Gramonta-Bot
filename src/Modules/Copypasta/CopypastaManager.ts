import fs from 'fs/promises';

export const getCopypstaList = async () => {
	const nameList = await fs.readdir('./media/Copypastas');
	return nameList.map((copypastaName, index) => ({
		copypastaName,
		index: index + 1,
	}));
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
		copypasta: await getCopyPastaByName(copypastaList[copypastaIndex].copypastaName),
		copypastaName: copypastaList[copypastaIndex],
	};
};

export const newCopyPasta = (copypastaName: string, copypasta: string) => {
	return fs.writeFile(`./media/Copypastas/${copypastaName}`, copypasta);
};

type CopypastaSearchResut = {
	copypasta: string;
	copypastaName: string;
	index: number;
};

export const getAllCopypastas = async (): Promise<CopypastaSearchResut[]> => {
	const copypastaList = await getCopypstaList();
	const results: Promise<CopypastaSearchResut>[] = [];

	return new Promise(resolve => {
		copypastaList.forEach(item => {
			results.push(
				getCopyPastaByName(item.copypastaName).then(copypasta => {
					return {
						copypasta,
						copypastaName: item.copypastaName,
						index: item.index,
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
