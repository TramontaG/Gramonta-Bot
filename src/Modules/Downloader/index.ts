import { Message } from '@open-wa/wa-automate';
import axios from 'axios';
import { Args, Module } from '../ModulesRegister';
import fs from 'fs/promises';

class Downloader extends Module {
	constructor() {
		super();

		this.registerPublicMethod({
			name: 'this',
			method: this.download.bind(this),
		});
	}

	async download(args: Args, requester: Message) {
		try {
			const link = args.immediate?.trim();
			if (!link) throw 'Por favor me envie o link do que deseja baixar';

			const extension = link.split('.').reduce((acc, e) => (acc = e));
			await this.zaplify?.replyAuthor('To baixando já!', requester);

			const file = (await axios.get(link)).data;
			const filePath = './media/FileDownload/file.' + extension;
			await fs.writeFile(filePath, file);

			await this.zaplify?.sendFileFromUrl(link, 'file.' + extension, requester);
		} catch (e) {
			this.zaplify?.replyAuthor('ERRO!: ' + JSON.stringify(e), requester);
		}
	}
}

export default Downloader;
