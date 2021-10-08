class Raffle {
	constructor() {
		this.raffles = {};
		this.adminOnly = false;
	}

	makeRaffle(id, raffleMaker, isAdmin) {
		if (!isAdmin && this.adminOnly) throw `Apenas admins podem criar sorteios`;
		if (!!this.raffles[id]) throw `Já existe um sorteio de ${id}`;
		this.raffles[id] = {
			word: id,
			raffleMaker,
			participants: [],
		};
		return true;
	}

	showParticipants(id) {
		this.validateRaffleId(id);
		return this.raffles[id].participants;
	}

	addParticipant(id, participant) {
		this.validateRaffleId(id);
		const participantIsAlreadyInRaffle = this.raffles[id].participants.reduce((acc, p) => {
			return acc || p === participant;
		}, false);
		if (participantIsAlreadyInRaffle) throw `${participant} Já está participando do sorteio!`;
		this.raffles[id].participants.push(participant);
	}

	removeParticipant(id, participant) {
		this.validateRaffleId(id);
		const newParticipantsList = this.raffles[id].participants.filter((p) => p !== participant);

		if (this.raffles[id].participants.length === newParticipantsList.length) {
			throw 'Participante não está incluido no sorteio';
		}

		this.raffles[id].participants = newParticipantsList;
	}

	startRaffle(id, caller) {
		this.validateRaffleId(id);
		if (caller !== this.raffles[id].raffleMaker) throw `Apenas ${this.raffles[id].raffleMaker} pode iniciar esse sorteio`;
		const choosenParticipantIndex = Math.floor(Math.random() * this.raffles[id].participants.length);
		const choosenParticipant = this.raffles[id].participants[choosenParticipantIndex];

		delete this.raffles[id];

		return choosenParticipant;
	}

	cancelRaffle(id, caller) {
		if (!this.raffles[id]) throw `Não existe nenhum sorteio de ${id}`;
		if (caller !== this.raffles[id].raffleMaker) throw `Apenas ${this.raffles[id].raffleMaker} pode cancelar esse sorteio`;
		this.validateRaffleId(id);
		delete this.raffles[id];
	}

	validateRaffleId(id) {
		if (this.raffles[id]) return true;
		else throw 'Id Inválido';
	}
}

module.exports = new Raffle();
