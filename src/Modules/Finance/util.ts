export const toMoneyString = (n: number) => {
	return 'R$' + n.toString().replace('.', ',');
};
