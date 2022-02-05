import axios, { AxiosInstance } from 'axios';
import {
	ImgFlipMemeList,
	JSON,
	MemeCreationModel,
	MemeCreationObject,
	MemeCreationResponse,
} from './Models';

class MemeApi {
	API: AxiosInstance;

	constructor() {
		this.API = axios.create({
			baseURL: 'https://api.imgflip.com',
		});
	}

	private encodeURIJson<T extends JSON>(Json: T) {
		return Object.keys(Json)
			.map(key => {
				return `${key}=${encodeURIComponent(Json[key])}`;
			})
			.join('&');
	}

	async getMemeList() {
		const memeList = await this.API.get<ImgFlipMemeList>('get_memes');
		if (!memeList.data.success) throw 'Error 500';
		return memeList.data.data.memes;
	}

	async searchMeme(query: string) {
		const memeList = await this.getMemeList();
		return memeList.filter(meme =>
			meme.name.toLowerCase().includes(query.trim().toLowerCase())
		);
	}

	async createMeme(id: string, json: MemeCreationModel) {
		const encodedData = this.encodeURIJson<MemeCreationObject>({
			template_id: id,
			username: process.env.IMGFLIP_USERNAME as string,
			password: process.env.IMGFLIP_PASSWORD as string,
			...json,
		});
		const response = await this.API.post<MemeCreationResponse>(
			'caption_image',
			encodedData,
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			}
		);
		return response.data;
	}
}

export default MemeApi;
