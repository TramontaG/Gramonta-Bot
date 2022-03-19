export const toMoneyString = (n: number) => {
	return '$' + n.toString().replace('.', ',');
};
