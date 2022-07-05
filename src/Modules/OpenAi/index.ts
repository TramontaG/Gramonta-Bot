import { Message } from "@open-wa/wa-automate";
import { Args, Module } from "../ModulesRegister";
import OpenAPI from "./API";
import * as Prompts from './prompts';

class OpenAI extends Module {
    constructor(){
        super();

        Object.keys(Prompts).forEach((promptKey) => {
            this.registerPublicMethod({
                name: promptKey,
                method: (args: Args) => this.question(args, promptKey as keyof typeof Prompts),
            })
        })
    }

    async question(args: Args, prompt: keyof typeof Prompts){
        const requester = {...this.requester} as Message;
        const question = args.immediate?.trim();
        try {
            if (!question) throw "Preciso de uma pergunta";
            const {response, tokensUsed} = await OpenAPI.instance.fromPrompt(prompt, question);
            this.zaplify?.replyAuthor([
                `*RESPOSTA DA AI:* ${response}`,
                '',
                `_Você usou um total de ${tokensUsed} tokens_`,
            ].join('\n'), requester);
        } catch (e) {
            this.zaplify?.replyAuthor(JSON.stringify(e), requester);
        }
    }
}

export default OpenAI;
