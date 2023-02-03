type SampleObject<T extends string> = {
	[key in T]?: any;
} & {
	[key: string]: any;
};

export const filterProperty = <T extends string>(
	object: SampleObject<T>,
	property: keyof SampleObject<T>
) => {
	return Object.keys(object)
		.filter((key: keyof SampleObject<''>) => key !== property)
		.reduce((obj: SampleObject<T>, key: string) => {
			return {
				...obj,
				[key]: object[key],
			} as SampleObject<''>;
		}, {} as SampleObject<''>);
};

export const randomItem = <T>(array: T[]) => {
	return array[Math.round(Math.random() * (array.length - 1))];
};

export const sliceArrayInChunks =
	(chunkLength: number) =>
	<T extends any[]>(arr: T): T[] =>
		arr.reduce((resultArray, item, index) => {
			const chunkIndex = Math.floor(index / chunkLength);

			if (!resultArray[chunkIndex]) {
				resultArray[chunkIndex] = [];
			}

			resultArray[chunkIndex].push(item);

			return resultArray;
		}, []);
