export const getFormattedDate = (d?: Date) => {
	const date = d || new Date();
	const days = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const year = date.getFullYear();
	return `${days}/${month}/${year}`;
};
