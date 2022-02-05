export type Meme = {
	id: string;
	name: string;
	url: string;
	width: number;
	height: number;
	box_count: number;
};

export type ImgFlipMemeList = {
	success: boolean;
	data: {
		memes: Meme[];
	};
};

export type JSON = {
	[key: string]: string;
};

export type MemeCreationObject = {
	template_id: string;
	username: string;
	password: string;
	[key: string]: string;
};

export type MemeCreationResponse = {
	success: boolean;
	data: {
		url: string;
		page_url: string;
	};
};

export type MemeCreationModel = {
	[key: string]: string;
};
