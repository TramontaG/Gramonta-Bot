import { bold, italic } from 'src/Helpers/TextFormatter';
import RaffleInstance from './RaffleInstance';

export const instructions = () => ['Sample Text'].join('\n');

export const raffleInUse = () =>
	[
		'Erro!!!',
		'Você já possui um sorteio acontecendo.',
		`Para cancelar seu sorteio, digite ${bold(`!sorteio cancelar`)}`,
	].join('\n');

export const noRaffleName = () =>
	[
		'Erro!!!',
		'Preciso saber o que você quer sortear!',
		`Para criar um sorteio digite ${bold(
			`!sorteio criar ${italic('o que será sorteado')}`
		)}`,
	].join('\n');

export const noCommand = () =>
	[
		'Erro!!!',
		'Preciso saber o que você quer fazer com esse sorteio!',
		`Para mais informações, digite ${bold('!sorteio help')}`,
	].join('\n');

export const alreadyParticipating = () =>
	['Erro!!!', 'Você já está participando desse sorteio'].join('\n');

export const notParticipating = () =>
	[
		'Erro!!!',
		'Você não pode sair desse sorteio porque você já não estava participando dele!',
	].join('\n');

export const raffleJoin = (raffle: RaffleInstance) =>
	[
		`Você agora está concorrendo a um sorteio de ${raffle.thing}!!!`,
		`Aguarde seu criador ${raffle.creatorID} realizar o sorteio`,
	].join('\n');

export const youAreNotTheOwner = () =>
	[
		'Erro!',
		'Você não é o criador desse sorteio. Só ele pode usar esse comando!',
	].join('\n');

export const raffleQuit = (raffle: RaffleInstance) =>
	[
		`Você não está mais concorrendo ao sorteio de ${raffle.thing}!!!`,
		`Para voltar à lista de participantes, digite ${bold(
			`!sorteio entrar ${raffle.thing}`
		)}`,
	].join('\n');

export const raffleWin = (raffle: RaffleInstance) =>
	[
		`VOCÊ GANHOU!`,
		`Meus parabéns, você ganhou um/uma ${raffle.thing}!`,
		`Uma boa sorte na proxima vez à todos os demais participantes`,
	].join('\n');
