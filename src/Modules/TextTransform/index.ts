import { Args, Module } from "../ModulesRegister";

class TextTransform extends Module {
    constructor(){
        super();
        
        this.registerPublicMethod({
            name: 'neutro',
            method: this.neutro.bind(this),
        })
    }

    neutro(args: Args){
        const message = this.zaplify?.messageObject?.quotedMsg?.body;
        if (!message) return this.zaplify?.replyAuthor("Responda uma mensagem com esse comando!");
        const rg = new RegExp(/(?<=\S)\Ss|(?<=\S{2})\S\b/g)
        return this.zaplify?.replyAuthor(message.replace(rg, 'es'));
    }
}

export default new TextTransform();
