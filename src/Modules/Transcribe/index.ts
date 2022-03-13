import { Message, MessageTypes } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';

import GoogleTranscriber from './Transcriber';

class Transcriber extends Module {
	audioMessage: Message;

	constructor() {
		super();
		this.audioMessage = this.zaplify?.messageObject as Message;

		this.registerPublicMethod({
			name: 'default',
			method: this.transcribe.bind(this),
		});
	}

	async transcribe(Args: Args) {
		try {
			this.audioMessage = this.zaplify?.messageObject?.quotedMsgObj as Message;

			this.assureVoice(this.audioMessage);

			const audioBuffer = await this.getAudioBuffer(this.audioMessage);
			await this.saveAudio(audioBuffer);

			const transcribedAudio = await GoogleTranscriber.transcribe(
				'media/temp/transcribableAudio.ogg'
			);
			console.log(transcribedAudio);
		} catch (e) {
			this.sendError(JSON.stringify(e), this.audioMessage);
		}
	}

	private async getAudioBuffer(requester: Message) {
		const audioBuffer = await this.zaplify?.getMediaBufferFromMessage(requester);
		if (!audioBuffer) throw 'Não consegui extrair audio dessa mensagem';
		return audioBuffer;
	}

	private assureVoice(requester: Message) {
		if (!(requester?.type === MessageTypes.VOICE)) {
			throw 'Por favor, marque uma mensagem de voz para eu transcrever';
		}
	}

	private saveAudio(audioBuffer: Buffer) {
		return fs.writeFile('media/temp/transcribableAudio.ogg', audioBuffer);
	}

	private sendError(error: string, requester: Message) {
		return this.zaplify?.replyAuthor('Error: ' + error, requester);
	}
}

export default Transcriber;
