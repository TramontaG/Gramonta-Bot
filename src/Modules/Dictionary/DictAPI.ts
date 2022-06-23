import axios, { AxiosInstance } from "axios";

export type WordMeaning = {
    partOfSpeech: string;
    meanings: string[];
    etymology: string;
}

export type Synonyms = string[];

export type Syllables = string[];

export type SentenceExample = {
    sentence: string;
    author: string;
}

class DictAPI {
    API: AxiosInstance;

    constructor(){
        this.API = axios.create({
            baseURL: "https://significado.herokuapp.com/v2"
        });
    }


    async meaning(word: string){
        try {
            const response = (await this.API.get<WordMeaning[]>(`/${word}`)).data;
            return response;
        } catch (e) {
            return undefined;
        }
    }

    async synonyms(word: string) {
        try {
            const response = (await this.API.get<Synonyms>(`/sinonimos/${word}`)).data;
            return response;
        } catch (e) {
            return undefined;
        }
    }

    async syllables(word: string) {
        try {
            const response = (await this.API.get<Syllables>(`/silabas/${word}`)).data;
            return response;
        } catch (e) {
            return undefined;
        }
    }

    async sentenceExample(word: string) {
        try {
            const response = (await this.API.get<SentenceExample[]>(`/frases/${word}`)).data;
            return response;
        } catch (e) {
            return undefined;
        }    
    }

}

export default DictAPI;
