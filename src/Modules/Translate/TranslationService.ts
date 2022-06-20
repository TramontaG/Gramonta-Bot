import {v2 as GoogleTranslate} from '@google-cloud/translate'

class TranslateService {
    private translator: GoogleTranslate.Translate;

    constructor(){
        this.translator = new GoogleTranslate.Translate();
    }

    async translate(text: string, from?: string, to?: string) {
        const result = await this.translator.translate(text, {
            from, 
            to,
        });

        return result[0];
    }
}

export default TranslateService;
