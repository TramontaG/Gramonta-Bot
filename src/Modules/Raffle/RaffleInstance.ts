import { Message } from '@open-wa/wa-automate';
import * as messages from './Messages';

type RaffleInstanceConstructorProps = {
	creatorID: string;
	thing: string;
};

class RaffleInstance {
	creatorID: string;
	thing: string;
	participants: Message[];

	constructor({ creatorID, thing }: RaffleInstanceConstructorProps) {
		this.creatorID = creatorID;
		this.thing = thing;
		this.participants = [];
	}

	addParticipant(participant: Message) {
		const alreadyParticipating = this.participants.some(
			p => p.author === participant.author
		);
		if (alreadyParticipating) throw messages.alreadyParticipating;
		this.participants.push(participant);
	}

	removeParticipant(participant: Message) {
		const notParticipating = this.participants.every(
			p => p.author !== participant.author
		);
		if (notParticipating) throw messages.notParticipating();
		this.participants = this.participants.filter(
			p => p.author !== participant.author
		);
	}

	go() {
		const randomIndex = Math.round(Math.random() * 9999) % this.participants.length;
		return this.participants[randomIndex];
	}
}

export default RaffleInstance;
