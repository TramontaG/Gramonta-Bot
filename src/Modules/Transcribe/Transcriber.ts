import speech, { SpeechClient, protos } from '@google-cloud/speech';
import { response } from 'express';
import fs from 'fs';

class Transcriber {
	client: SpeechClient;
	uri: string;

	constructor() {
		this.client = new speech.SpeechClient();
		this.uri = '';
	}

	async transcribe(audioPath: string) {
		const audioContent = fs.readFileSync(audioPath).toString('base64');

		const request = this.client.recognize({
			audio: {
				content: audioContent,
			},
			config: {
				encoding: 'OGG_OPUS',
				sampleRateHertz: 48000,
				languageCode: 'pt-BR',
				model: 'default',
			},
		});

		return request.then(([response]) => response);
	}
}

export default new Transcriber();
