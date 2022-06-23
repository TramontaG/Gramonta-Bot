
import { Message } from "@open-wa/wa-automate";
import { Args, Module } from "../ModulesRegister";
import TranslateService from "./TranslationService";
import fs from 'fs/promises';

type TranslatorArgs = Args & {
    from?: string;
    to?: string;
}

class Translate extends Module {
    translateService: TranslateService;

    constructor(){
        super();
        this.translateService = new TranslateService();

        ['pt', 'en', 'es', 'ru', 'ja', 'fr', 'de'].forEach(lang => this.registerPublicMethod({
            method: (args: TranslatorArgs) => this.translate(args, lang),
            name: lang,
        }));

        this.registerPublicMethod({
            name: 'default',
            method: this.help.bind(this),
        })
        
    }

    async translate(args: TranslatorArgs, to: string){
        const requester = this.requester as Message;

        try {
            if (requester.isMedia) throw "Só consigo traduzir textos!";
            
            const text = args.immediate?.trim() || requester.quotedMsg?.body;
            if (!text) throw "Não consegui encontrar texto para traduzir";
            
            const {from} = args;
            const translation = await this.translateService.translate(text, from, to);

            return this.zaplify?.replyAuthor(translation, requester);

        } catch (e){                      
            console.log(e);
            this.zaplify?.replyAuthor(JSON.stringify(e), requester);
        }
    }

    async help() {
		fs.readFile('src/Modules/Translate/Help.txt', {
			encoding: 'utf-8',
		}).then(helpText => {
			this.zaplify?.replyAuthor(helpText);
		});
	}
}

export default Translate;
