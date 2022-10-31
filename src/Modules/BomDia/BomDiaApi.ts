import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'https://tiapi-production.up.railway.app';

type MessagesResponse = {
	texts: string[];
	images: {
		src: string;
		alt: string;
	}[];
};

class MensagensAPI {
	instance: AxiosInstance;

	constructor() {
		this.instance = axios.create({
			baseURL: BASE_URL,
		});
	}

	mundoDasMensagens(endpoint: string, page?: number) {
		return this.instance.get<MessagesResponse>('/mundodasmensagens' + endpoint, {
			params: {
				page,
			},
		});
	}

	mensagensComAmor(endpoint: string, page?: number) {
		return this.instance.get<MessagesResponse>('/mensagenscomamor' + endpoint, {
			params: {
				page,
			},
		});
	}

	belasMensagens(endpoint: string, page?: number) {
		return this.instance.get<MessagesResponse>('/belasMensagens' + endpoint, {
			params: {
				page,
			},
		});
	}
}

export default MensagensAPI;
