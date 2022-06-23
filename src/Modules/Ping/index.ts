import { Args, Module } from "../ModulesRegister";

class Ping extends Module {
    constructor(){
        super();

        this.registerPublicMethod({
            name: 'default',
            method: this.pong.bind(this)
        });
    }

    pong(_: Args){
        this.zaplify?.replyAuthor("pong");
    }
}

export default Ping
