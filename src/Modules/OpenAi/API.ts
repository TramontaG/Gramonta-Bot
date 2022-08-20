import axios, { AxiosInstance } from 'axios';
import { Configuration, OpenAIApi } from 'openai';
import * as Prompts from './prompts';

type Options = {
    model?: string;
    temperature?: number,
    max_tokens?: number,
    top_p?: number,
    frequency_penalty?: number,
    presence_penalty?: number,
    stop?: string[],
}

type Prompt = keyof typeof Prompts;

export default class OpenAPI {
    API: OpenAIApi;
    static APIInstance: OpenAPI;
    axiosInstance: AxiosInstance;

    constructor(){
        const apiKey = this.apiKey;
        const config = new Configuration({
            apiKey,
        });
        this.API = new OpenAIApi(config);
        this.axiosInstance = axios.create({
            baseURL: "https://api.openai.com/v1",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            }
        })
    }

    /**
     * I still dont know how to lazy load the key
     * this is necessary because if I don't use the
     * singleton pattern, the env is not yet loaded
     * when the instance is created. I have to create
     * it when the first command is ran.
     * 
     * I'm accepting solutions to that, please leave a
     * PR. Just don't care enough to think in a solution
     * in this side project.
     * @returns 
     */
    private get apiKey(){
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw "Unable to find API key";
        return apiKey;
    }
    
    public static get instance(){
        if (this.APIInstance) return this.APIInstance;
        this.APIInstance = new OpenAPI();
        return this.APIInstance;
    }

    /**
     * This is using a standard axios request because
     * the openAI module does not export a method for 
     * moderation
     * @param prompt 
     */
    private async isSafe(input: string) {
        const response = await this.axiosInstance.post("/moderations", {
            input, 
        });
        return response.data.results[0].flagged !== 1;
    }

    async fromPrompt(prompt: Prompt, query: string, options?: Options){

        const isSafe = await this.isSafe(query);
        if (!isSafe) throw "Please do not use this language with the AI.";

        const response = await this.API.createCompletion({
            model: "text-curie-001",
            prompt: Prompts[prompt](query),
            temperature: .5,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: .3,
            presence_penalty: .3,
            ...options,
        });
        
        const result = {
            response: response.data.choices?.[0].text?.trim() || "The AI could not find and anwnser",
            //the type declaration is missing the property usage. Plz open ai, fix this <3
            tokensUsed:  (response.data as any).usage.total_tokens 
        }

        return result;
    }

}
