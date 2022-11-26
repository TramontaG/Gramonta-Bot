import { Message } from "@open-wa/wa-automate";
import { Args, Module } from "../ModulesRegister";

class Ping extends Module {
    constructor(){
        super();
        this.makePublic("default", this.pong);
    }

    pong(_: Args, requester: Message){
        this.zaplify?.replyAuthor("pong", requester);
    }
}

export default Ping
