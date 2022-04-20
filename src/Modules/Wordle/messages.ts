import Guesser, { LetterStatus } from './Guesser';

export const ERROR = (e: unknown) => `Erro: ${e}`;

export const WORDLE_DEFAULT = () =>
	[
		'*WORDLE NO ZAP*',
		'Para jogar, digite !wordle guess _seu chute_',
		'Para instruções, digite !wordle help',
		'BOA SORTE!!!',
	].join('\n');

export const HELP = () =>
	[
		'*WORDLE NO ZAP!!!*',
		'Cada número tem direito a uma palavra por dia.',
		'Sua palavra NÃO É COMPARTILHADA!!! Cada um recebe uma palavra diferente',
		'Sua palavra será diferente depois da meia noite',
		'Você tem 6 chances para acertar sua palavra. Caso não consiga, tente uma palavra nova no dia seguinte.',
		'As palavras tem todas 5 letras, são em português e não levam em conta acentos.',
		'',
		'*INSTRUÇÕES:*',
		'Envie *!wordle guess _sua palavra_* para fazer o chute',
		'A palavra ja é automaticamente sorteada e atrelada ao seu número e você já consome a primeira tentativa, assim como no jogo original',
		'Você só pode enviar chutes de 5 letras. Se seu chute tiver numeros, símbolos ou uma quantidade diferente de letras ele será rejeitado',
		'A resposta do seu chute será dada na forma de 5 quadrados coloridos. Cada quadrado representa uma letra do seu chute e cada cor significa um resultado para aquela letra, de acordo com a legenda',
		'O primeiro quadrado representa a primeira letra, o segundo quadrado a segunda letra e assim por diante',
		'Se você acertar a palavra você ganha o jogo. Não estou mantendo pontuação ou ranking AINDA, mas em breve incluirei essa funcionalidade',
		'',
		'_-----LEGENDA-----_',
		'⬛: A letra não faz parte da palavra',
		'🟨: A letra faz parte da palavra mas está no lugar incorreto',
		'🟩: A letra faz parte da palavra e está no lugar correto',
	].join('\n');

export const GUESS_STATUS = (guesser: Guesser) =>
	[
		`*TENTATIVA ${guesser.tries}/6*`,
		'______________________',
		guesser.history.map(tries => createSquares(tries)).join('\n'),
		footer(guesser),
	].join('\n');

const createSquares = (guessResult: LetterStatus[]) =>
	guessResult
		.map(letterResult => {
			if (letterResult === LetterStatus.LetterNotFound) return '⬛';
			if (letterResult === LetterStatus.LetterInWord) return '🟨';
			if (letterResult === LetterStatus.LetterInIndex) return '🟩';
		})
		.join('');

const footer = (guesser: Guesser) => {
	if (guesser.won) return footerWin(guesser);
	if (guesser.tries === 6) return footerLose(guesser);
	return footerMiss(guesser);
};

const footerLose = (guesser: Guesser) => {
	return [
		'Puxa vida, suas tentativas acabaram',
		`Sua palavra era *_${guesser.word.stringRepresentation}_*`,
	].join('\n');
};

const footerMiss = (guesser: Guesser) => {
	return ['Tente novamente!'].join('\n');
};

const footerWin = (guesser: Guesser) => {
	return [
		'PARABÉNS!!!',
		'Você acertou a palavra. Volte amanhã e jogue de novo!',
	].join('\n');
};

const wonOnLastRound = (guesser: Guesser) => {
	const isOnLastRound = guesser.tries === 6;
	const won = guesser.won;
	return isOnLastRound && won;
};
