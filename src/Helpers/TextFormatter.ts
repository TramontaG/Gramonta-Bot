type NormalizedLetterMap = {
	[key: string]: string;
};

export const bold = (s: string) => `*${s}*`;
export const italic = (s: string) => `_${s}_`;
export const stroke = (s: string) => `~${s}~`;
export const monospace = (s: string) => `\`\`\`${s}\`\`\``;

export function normalizeLetter(letter: keyof NormalizedLetterMap) {
	const normalizedLetterMap: NormalizedLetterMap = {
		['à']: 'a',
		['á']: 'a',
		['ã']: 'a',
		['â']: 'a',
		['é']: 'e',
		['è']: 'e',
		['í']: 'i',
		['ì']: 'i',
		['õ']: 'o',
		['ô']: 'o',
		['ò']: 'o',
		['ó']: 'o',
		['û']: 'u',
		['ú']: 'u',
		['ç']: 'c',
	};

	return normalizedLetterMap[letter] || (letter as string);
}

/**
 * I'm having trouble using string.normalize on node environment. Better
 * to just create my own normalizing function
 * @param string the string you want to normalize
 */
export function normalizeString(string: string) {
	return string.split('').map(normalizeLetter).join('');
}
