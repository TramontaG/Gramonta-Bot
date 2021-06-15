const { decryptMedia } = require('@open-wa/wa-decrypt')
const fs = require('fs-extra')
const axios = require('axios')
const moment = require('moment-timezone')
const get = require('got')
const fetch = require('node-fetch')
const color = require('./lib/color')
const { randomNimek, fb, sleep } = require('./lib/functions')
const { help } = require('./lib/help')
const welkom = JSON.parse(fs.readFileSync('./lib/welcome.json'))
const path = require('path');

const http = require('http');
const https = require('https');
const urlParse = require('url').parse;

const gify = require('gify')
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const YTsearch = require('youtube-search');
const googleTTS = require('google-tts-api'); // CommonJS

//const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

moment.tz.setDefault('America/Sao_Paulo').locale('id')

module.exports = msgHandler = async (client, message) => {
    try {

        const { urlParametro, type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName } = sender
        pushname = pushname || verifiedName
        const commands = caption || body || ''
        const falas = commands.toLowerCase()
        const command = commands.toLowerCase().split(' ')[0] || ''
        const args =  commands.split(' ')

        const msgs = (message) => {
            if (command.startsWith('!')) {
                if (message.length >= 10){
                    return `${message.substr(0, 15)}`
                }else{
                    return `${message}`
                }
            }
        }
        
        const YD = new YoutubeMp3Downloader({
            "ffmpegPath": "/usr/bin/ffmpeg",        // FFmpeg binary location
            "outputPath": "./media/to/mp3",    // Output file location (default: the home directory)
            "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
            "queueParallelism": 3,                  // Download parallelism (default: 1)
            "progressTimeout": 5000,                // Interval in ms for the progress reports (default: 1000)
            "allowWebm": true,                      // Enable download from WebM sources (default: false)
            "outputOptions" : ["-af", "silenceremove=1:0:-50dB", '-movflags','frag_keyframe+empty_moov'], // Additional output options passend to ffmpeg
            "youtubeVideoQuality": 'lowest'
        });

        const mess = {
            wait: '⏳ Espera porra, já to fazendo a figurinha...',
            error: {
                St: '[❗] Envie uma imagem com uma legenda *!s* ou marque a imagem que já foi enviada',
            }
        }

        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const botNumber = await client.getHostNumber()
        const blockNumber = await client.getBlockedIds()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const ownerNumber = ["5531984928178@c.us","5531984928178"] // replace with your whatsapp number
        const isOwner = ownerNumber.includes(sender.id)
        const isBlocked = blockNumber.includes(sender.id)
        const uaOverride = 'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi)
        if (!isGroupMsg && command.startsWith('!')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname))
        if (isGroupMsg && command.startsWith('!')) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname), 'in', color(formattedTitle))
        //if (!isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname))
        if (isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname), 'in', color(formattedTitle))
        if (isBlocked) return
        //if (!isOwner) return

        console.log('FROM ===>', color(pushname))
        console.log('ARGUMENTOS ===>', color(args))
        console.log('FALAS ====>', color(falas))
        console.log('COMANDO ====>', color(command))
        console.log('ALGUEM FALOU DE MIM =====>', color(falas.indexOf("bot") != -1) )

        let compare = "/9j/4aaqskzjrgabaqaaaqabaad/2wbdaamcagicagmcagidawmdbayebaqebaggbgugcqgkcgkicqkkda8mcgsocwkjdrendg8qebeqcgwsexiqew8qebd/2wbdaqmdawqdbagebagqcwklebaqebaqebaqebaqebaqebaqebaqebaqebaqebaqebaqebaqebaqebaqebaqebaqebd/waarcabkagqdasiaahebaxeb/8qahaaaagmaaweaaaaaaaaaaaaabgcabaubagmi/8qapbaaaqmcbqiebqeecquaaaaaaqidbauraaysitetqqciuweumngbkrujqlkhccqzynkx0ehwjuscssh/xaaaaqacawebaaaaaaaaaaaaaaaebqidbgeh/8qalxeaaqqbbaagagecbwaaaaaaaqacaxeeeiexqqutuwgbksjxorthjdizschr8f/aaawdaqaceqmrad8anjnarhrzluzrjckrii98bnqp/wauww1nnunjbg49jmhpoaxzn9oltkh33bvjbktdqx0i5xj3sua4fairtohlcp096e903ueei4wn1jjtlursui2gzmogqzmjt6djunt/adwc5tggmvnevtisoshfpythtdjravllpyanhdyxzwkrl9w+k1urseepshlbtadxqixhkz5l+shxw9xbadqfkdbip+2ckkqdstt42bokaylkstrsei5omupminvhpaim1akjbptsq559dz9sdlezfnjwxorsj1lrloehyqdiavsqf72w/oib7sdparbk0ulb3r1cmpwxsfxbaqkk+pn9vrx+ceepugwpxzhc4vwxc3u95mzgolzf5morngxcbae4btb1smmqmikvoemyogqsut2to9j74sptccisksafrjrynjgfi1rt2uqfdqxvt2c1ddkl+p9fbg7dcbn0poop2p1xic"
        if(falas.indexOf(compare) != -1){
            await client.reply(from, `Ah pronto, começou os maconheiro!`, id)
        }
        
        if( falas.indexOf("bot") != -1 ){

            await client.reply(from, 'Oi? ta falando de mim? é só digitar: *me ajuda*', id)
            const gif4 = await fs.readFileSync('./media/pensando.webp', { encoding: "base64" })
            await client.sendImageAsSticker(from, `data:image/gif;base64,${gif4.toString('base64')}`)

        }

        if( (falas.indexOf("caralho") != -1) || (falas.indexOf("cuzao") != -1) || (falas.indexOf("porra") != -1) || (falas.indexOf("caraleo") != -1) || (falas.indexOf("piranha") != -1) || (falas.indexOf("puta") != -1) ){

            await client.reply(from, 'Sem palavrões por favor...', id)

        }

        switch(falas) {

            case 'me ajuda bot':
            case 'me ajuda':
            case 'bot me ajuda':
                client.sendText(from, help)
            break
            
            case '!berrante':
            case 'toca berrante':
            case 'toca o berrante':
            case 'bot toca berrante':
            case 'toca o berrante bot':
            case 'toca o berrante savio':
                await client.sendFile(from, './media/berrante.mpeg', 'Toca o berrante seu moço', 'AAAAAAAAAUHHH', id)
                break

            case 'garibalda sua safada':
                client.sendText(from, 'Esse comando foi desativado!', id)
            break

            case 'oi bot conversa comigo vei':
            case 'conversa comigo bot':
                client.sendText(from, 'Eu não, tem nada melhor pra fazer não?', id)
            break

            case 'oi sumida':
            case 'oi ta sumida':
            case 'oi sua sumida':
            case 'e ai isabelle':
            case 'e aí isabelle':
            case 'e aí Isabelle':
                
                let songsArray1 = [
                    './media/oisumida.ogg',
                ];
                let randomNumber1 = Math.floor(Math.random()*songsArray1.length);
                let escolhido1 = songsArray1[randomNumber1];

                await client.sendFile(from, escolhido1, '', 'AAAAAAAAAUHHH', id)
            break

            case 'sexto':
            case 'sextou':
            case 'sextô':
            case 'sextôu':
                await client.reply(from, 'ôpa, bora??', id)
                const gif1 = await fs.readFileSync('./media/sexto.webp', { encoding: "base64" })
                await client.sendImageAsSticker(from, `data:image/gif;base64,${gif1.toString('base64')}`)
                break
                    
            case 'bot gay':
            case 'o bot é gay':
            case 'o bot é cuzao':
            case 'vai tomar no cu bot':
            case 'tomar no cu bot':
            case 'bot viado':
            case 'cu bot':
            case 'o bot viado':
            case 'bot otario':
            case 'o é bot otario':
            case 'o bot otario':
            case 'bot lixo':
            case 'fodas bot':
            case 'vai se fuder bot':
            case 'vai se foder bot':
            case 'o bot lixo':
                
                await client.reply(from, 'É pra esculachar?...', id)
                const gif2 = await fs.readFileSync('./media/xingping.webp', { encoding: "base64" })
                await client.sendImageAsSticker(from, `data:image/gif;base64,${gif2.toString('base64')}`)
                break

            case 'bom dia bot':
                await client.reply(from, 'Bom dia? so se for pra você que dormiu a noite toda...', id)
                const gif3 = await fs.readFileSync('./media/tudosobcontrole.webp', { encoding: "base64" })
                await client.sendImageAsSticker(from, `data:image/gif;base64,${gif3.toString('base64')}`)
                break
    
            case 'boa tarde bot':
                await client.reply(from, `Boa tarde, são ${moment().format('HH:mm')} e vc ta ai atoa ne? ligando pro seu chefe...`, id)
                break
    
            case 'boa noite bot':
                await client.reply(from, `Boa noite pra você também! já são ${moment().format('HH:mm')} to indo nessa também...`, id)
                break
    
            case 'que dia e hoje bot':
            case 'que dia é hoje bot':
            case 'oi bot que dia é hoje?':
            case 'que dia e hoje?':
            case 'que dia é hoje?':
                await client.reply(from, `Tem calendário não? hoje é dia ${moment().format('DD/MM/YYYY HH:mm:ss')}`, id)
            break

            case 'que dia e hoje bot ?':
            case 'que dia é hoje bot ?':
            case 'que dia e hoje ?':
            case 'que dia é hoje ?':
                await client.reply(from, `Tira o espaço entre o texto e virgula, e vc não tem calendário não? hoje é dia ${moment().format('DD/MM/YYYY HH:mm:ss')}`, id)
            break

            case 'oi bot':
                await client.reply(from, 'Fala? que ta pegando? sei fazer algumas coisas, digite: *me ajuda*', id)
                break

            case 'tocufome':
            case 'to com fome':
            case 'estou com fome':
                await client.reply(from, 'Come uai...', id)
                break    

            case 'como vc está bot?':
            case 'como vai bot?':
            case 'bot como vc está?':
            case 'bot como vai?':
            case 'oi bot como vai?':
            case 'bot como vc esta?':
            case 'oi bot como vc esta?':
            case 'oi bot como vc ta?':
                const gif99 = await fs.readFileSync('./media/tranquilao.webp', { encoding: "base64" })
                await client.sendImageAsSticker(from, `data:image/gif;base64,${gif99.toString('base64')}`)
                break
    
            case 'fala bot':
                await client.reply(from, 'Fala você... ou digite: !ajuda', id)
                const gif4 = await fs.readFileSync('./media/pensando.webp', { encoding: "base64" })
                await client.sendImageAsSticker(from, `data:image/gif;base64,${gif4.toString('base64')}`)
                break
        }

        switch(command) {
        
        case 'y0':
            if( ( typeof(teste) != 'undefined' ) ) {
                await client.sendText(from, `Copie e cole`, id)
                await client.sendText(from, `${teste[0]}`, id)
            }else{
                await client.sendText(from, `Pesquise algo para começar...`, id)
            } 
            break;
        case 'y1':
            if( ( typeof(teste) != 'undefined' ) ) {
                await client.sendText(from, `Copie e cole`, id)
                await client.sendText(from, `${teste[1]}`, id)
            }else{
                await client.sendText(from, `Pesquise algo para começar...`, id)
            } 
            break;
        case 'y2':
            if( ( typeof(teste) != 'undefined' ) ) {
                await client.sendText(from, `Copie e cole`, id)
                await client.sendText(from, `${teste[2]}`, id)
            }else{
                await client.sendText(from, `Pesquise algo para começar...`, id)
            } 
            break;
        case 'y3':
            if( ( typeof(teste) != 'undefined' ) ) {
                await client.sendText(from, `Copie e cole`, id)
                await client.sendText(from, `${teste[3]}`, id)
            }else{
                await client.sendText(from, `Pesquise algo para começar...`, id)
            } 
            break;
        case 'y4':
            if( ( typeof(teste) != 'undefined' ) ) {
                await client.sendText(from, `Copie e cole`, id)
                await client.sendText(from, `${teste[4]}`, id)
            }else{
                await client.sendText(from, `Pesquise algo para começar...`, id)
            } 
            break;
        case 'y5':
            if( ( typeof(teste) != 'undefined' ) ) {
                await client.sendText(from, `Copie e cole`, id)
                await client.sendText(from, `${teste[5]}`, id)
            }else{
                await client.sendText(from, `Pesquise algo para começar...`, id)
            }
            break;

        case 'tts!':
            if (args.length === 1) return client.reply(from, 'Como eu vou adivinhar o devo buscar?', id)
            let termoBusca = body.split('!');
            url = await googleTTS.getAudioUrl(`${termoBusca[1]}`,{
                lang: 'pt_BR',
                slow: false,
                host: 'https://translate.google.com',
            });

            const dest = await path.resolve(__dirname, './media/to/translate.mp3'); // file destination
            await downloadFile(url, dest);
            await client.sendFile(from, './media/to/translate.mp3', 'translate', 'AAAAAAAAAUHHH', id)

            //await client.sendText(from, `${url}`, id)

            break
        case '!buscamusica':
        case '!youtube':
        case '!bm':
        case '!buscarmusica':
            
            if (args.length === 1) return client.reply(from, 'Como eu vou adivinhar o devo buscar?', id)

            let opts = {
                maxResults: 5,
                key: 'AIzaSyA53q1WJv1-6IqyCVjqHjlar7pWfKiTOtQ'
            };
              
            await YTsearch(args[1], opts, async (err, results) => {
                if(err) return console.log(err);
                let resultado = ``
                teste = [];
                results.forEach( async(data, index) => {
                    teste[`${index}`] = `!yt youtu.be=${data?.id}`;
                    resultado += `\n*Titulo*: ${data?.title}\n*Link*: https://youtu.be/${data?.id}\n*Baixe:* !yt youtu.be=${data?.id} *[ y${index} ]*\n---\n`;
                });
                await client.reply(from, `Achei isso aqui...\n${resultado}`, id)
            });

            break
        case '!bateria':

            let level = await client.getBatteryLevel()
            await client.reply(from, `----------------------\nNível de bateria é de: ${JSON.stringify(level)}%\n----------------------`, id)   
      
        case '!yt':
        case '!baixarvideo':

            if (args.length === 1) return client.reply(from, 'Como eu vou adivinhar o video sem o link?', id)

            try {

                const url = `${args[1]}`
                const ID_VIDEO = url.split('=')[1];
                console.log('URL DO VIDEO ====>', url)
                console.log('ID DO VIDEO ====>', ID_VIDEO)

                await client.reply(from, `Baixando e convertendo o video em mp3...`, id)
                await YD.download(`${ID_VIDEO}`);

                await YD.on("finished", async (err, data) => {
                    await client.sendFile(from, data?.file, '', 'AAAAAAAAAUHHH', id)
                    await client.reply(from, `_Ufa, eita trem pesado, mas ta na mão..._\n\n*Titulo*: ${data?.title}\n*Link*: https://youtu.be/${ID_VIDEO}\n-----\n*Transferidos*: ${Math.round(data?.stats?.transferredBytes) }kb \n*Velocidade média*: ${Math.round(data?.stats?.averageSpeed)}`, id)
                });

                YD.on("progress", async (progress) => {
                    let percente = parseInt(progress?.progress?.percentage);
                    console.log(`BAIXANDO O VIDEO ===> ${percente}%`)
                });
                
                YD.on("error", async (error) => {
                    console.log(`ERRO AO BAIXAR VIDEO ===> ${JSON.stringify(error)}`);
                    await client.reply(from, `Porra bicho, não estou conseguindo baixar, tenta de novo...`, id)
                });

            } catch (error) {
                await client.reply(from, `Porra bicho, deu merda... tenta de novo. \n\n${JSON.stringify(error)}`, id)
            }

            break
        
        case '!cep':

            if (args.length === 1) return client.reply(from, 'Como eu vou adivinhar o cep?', id)

            let response = await axios.get(`https://viacep.com.br/ws/${args[1]}/json/`)
            const { logradouro, bairro, localidade, siafi, ibge } = response.data

            await client.reply(from, 'Buscando o CEP... pera um pouco', id)
            await client.sendText(from, `🌎️ Rua: ${logradouro}, ${bairro}, ${localidade}\nSiafi: ${siafi}, Ibge: ${ibge} `)

            break

        case '!eununca':
        case '!jogodavelha':
        case '!verdadeouconsequencia':

            await client.reply(from, 'Eu ainda estou aprendendo isso, tem um preview...', id)

            let play1 = from
            console.log(`PLAY 1 ===>`, play1)

            if (mentionedJidList.length === 0) return client.reply(from, 'Para usar este comando, envie o comando *!jogarjogovelha* @tagmember', id)
            for (let i = 0; i < mentionedJidList.length; i++) {
                //if (groupAdmins.includes(mentionedJidList[i])) return client.reply(from, mess.error.Ki, id)

                console.log(`PLAY ${i} ===>`, mentionedJidList[i])
                play2 = mentionedJidList[i]
            }

            //let play2 = play2

            switch (command) {
                case 'X':
                    _1 = 'X';
                    break;
                case 'O':
                    _1 = 'X';
                    _9 = 'X';
                    break;

                case '1':
                    _1 = 'X';
                    _2 = 'X';
                    _3 = 'X';
                    _4 = 'X';
                    _5 = 'X';
                    _6 = 'X';
                    _7 = 'X';
                    _8 = 'X';
                    _9 = 'X';
                    break;
            }
            
            //await client.reply(from, 'Ah, então vamos jogar jogo da velha? bora começar...', id)
            await client.sendText(from, `1 2 3\n4 5 6\n7 8 9`)
            await client.sendText(from, ` *${play1}* x *${play2}*\nPor quem vamos começar?`)

            await client.reply(from, 'Isso é tudo..', id)

            break

        case '!meunumero':

            let chatNumber = sender.id.split('-')
            let ddd = chatNumber[0].substring(2, 4)
            let number = chatNumber[0].substring(4, 12)

            client.reply(from, `Seu numero é: *${number}* seu ddd é: *${ddd}*`, id)

            break
            
        case '!kickme':

            client.reply(from, 'Agooora! kkkk', id)

            await client.removeParticipant(groupId, sender.id)

            break
        case '!sticker':
        case '!stiker':
        case '!s':
            if (isMedia && type === 'image') {
                const mediaData = await decryptMedia(message, uaOverride)
                const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (quotedMsg && quotedMsg.type == 'image') {
                const mediaData = await decryptMedia(quotedMsg, uaOverride)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64)
            } else if (args.length === 2) {
                const url = args[1]
                if (url.match(isUrl)) {
                    await client.sendStickerfromUrl(from, url, { method: 'get' })
                        .catch(err => console.log('Caught exception: ', err))
                } else {
                    client.reply(from, mess.error.Iv, id)
                }
            } else {
                    client.reply(from, mess.error.St, id)
            }
            break
        case '!stickergif':
        case '!stikergif':
        case '!sg':
        case '!sgif':
            if (isMedia) {

                if (mimetype === 'video/mp4' && message.duration < 30 || mimetype === 'image/gif' && message.duration < 30) {
                    const mediaData = await decryptMedia(message, uaOverride)
                    client.reply(from, 'Pera porra, já to fazendo a figurinha!', id)
                    const filename = `./media/aswu.${mimetype.split('/')[1]}`
                    await fs.writeFileSync(filename, mediaData)

                    let opts = {
                        rate: 30,
                        delay: 0
                    };

                    await gify(`${filename}`, './media/output.gif', opts, async (error) => {
                        if (error) {
                            
                            client.reply(from, `Pera ai que deu alguma merda... Tente novamente mais tarde mostra isso pro jhon\n${error}`, id)

                        };
                            
                        const gif = await fs.readFileSync('./media/output.gif', { encoding: "base64" })
                        await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                        
                    });

                } else (
                    client.reply(from, '[❗] Envie o vídeo com a legenda *!sg* máx. 30 segundos!', id)
                )
            }
            break

        case '!modoadm':
        case '!autoadm':
            if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos!', id)
            if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado pelo grupo Admin!', id)
            if (args.length === 1) return client.reply(from, 'Escolha habilitar ou desabilitar!', id)

            if (args[1].toLowerCase() === 'enable') {

                welkom.push(chat.id)
                fs.writeFileSync('./lib/welcome.json', JSON.stringify(welkom))
                await client.reply(from, 'O modo auto-adm foi ativado com sucesso neste grupo!', id)
            
            } else if (args[1].toLowerCase() === 'disable') {

                welkom.splice(chat.id, 1)
                fs.writeFileSync('./lib/welcome.json', JSON.stringify(welkom))
                await client.reply(from, 'O recurso de auto-adm foi desabilitado com sucesso neste grupo!', id)

            } else {
                await client.reply(from, 'Selecione habilitar ou desabilitar!', id)
            }
            break

        case '!linkdogrupo':
        case '!lg':

            if (!isBotGroupAdmins) return client.reply(from, 'Este comando só pode ser usado quando o bot se torna administrador', id)
            if (isGroupMsg) {
                const inviteLink = await client.getGroupInviteLink(groupId);
                client.sendLinkWithAutoPreview(from, inviteLink, `\nLink do grupo: *${name}*`)
            } else {
            	client.reply(from, 'Este comando só pode ser usado em grupos!', id)
            }
            break

        case '!adminlista':
            if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos!', id)
            let mimin = ''
            for (let admon of groupAdmins) {
                mimin += `➸ @${admon.replace(/@c.us/g, '')}\n` 
            }
            await client.sendTextWithMentions(from, mimin)
            break

        case '!donodogrupo':

            if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos!', id)
            const Owner_ = chat.groupMetadata.owner
            await client.sendTextWithMentions(from, `Dono do grupo: @${Owner_}`)
            break

        case '!mencionartodos':

            if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos!', id)
            if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id)
            const groupMem = await client.getGroupMembers(groupId)
            let hehe = '╔══✪〘 Aviso geral 〙✪══\n'
            for (let i = 0; i < groupMem.length; i++) {
                hehe += '╠➥'
                hehe += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
            }
            hehe += '╚═〘 Bot do Jhon 〙'
            await client.sendTextWithMentions(from, hehe)
            break

        case '!deixartudo':

            if (!isOwner) return client.reply(from, 'Este comando é apenas para o bot Proprietário', id)
            const allChats = await client.getAllChatIds()
            const allGroups = await client.getAllGroups()
            for (let gclist of allGroups) {
                await client.sendText(gclist.contact.id, `Os bots estão limpando, o bate-papo total está ativo: ${allChats.length}`)
                await client.leaveGroup(gclist.contact.id)
            }
            client.reply(from, 'Sucesso!', id)
            break

        case '!limpartudo':

            if (!isOwner) return client.reply(from, 'Este comando é apenas para o bot Proprietário', id)
            const allChatz = await client.getAllChats()
            for (let dchat of allChatz) {
                await client.deleteChat(dchat.id)
            }
            client.reply(from, 'Sucesso!', id)
            break

        case '!adicionar':
        case '!add':

            const orang = args[1]
            if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id)
            if (args.length === 1) return client.reply(from, 'Para usar este recurso, envie o comando *!adicionar* 55319xxxxx', id)
            if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Este comando só pode ser usado quando o bot se torna administrador', id)
            try {
                await client.addParticipant(from,`${orang}@c.us`)
            } catch {
                await client.reply(from, mess.error.Ad, id)
            }
            break

        case '!ban':

            if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id)
            if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Este comando só pode ser usado quando o bot se torna administrador', id)
            
            if (mentionedJidList.length === 0) return client.reply(from, 'Para usar este comando, envie o comando *!ban* @tagmember', id)
            await client.sendText(from, `Pronto! removido \n${mentionedJidList.join('\n')}`)
            
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return client.reply(from, mess.error.Ki, id)

                console.log("BANIDO ===>", mentionedJidList[i])
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break

        case '!sair':

            if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos', id)
            if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id)
                await client.sendText(from,'Sayonara').then(() => client.leaveGroup(groupId))
            break

        case '!promover':

            if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id)
            if (!isGroupAdmins) return client.reply(from, 'Este recurso só pode ser usado por administradores de grupo', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Este recurso só pode ser usado quando o bot se torna administrador', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Para usar este recurso, envie o comando *!promover* @tagmember', id)
            if (mentionedJidList.length >= 2) return client.reply(from, 'Desculpe, este comando só pode ser usado por 1 usuário.', id)
            if (groupAdmins.includes(mentionedJidList[0])) return client.reply(from, 'Desculpe, o usuário já é um administrador.', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Comando aceito, adicionado @${mentionedJidList[0]} como admin.`)
            break

        case '!rebaixar':

            if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id)
            if (!isGroupAdmins) return client.reply(from, 'Este recurso só pode ser usado por administradores de grupo', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Este recurso só pode ser usado quando o bot se torna administrador', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Para usar este recurso, envie o comando *!rebaixar* @tagadmin', id)
            if (mentionedJidList.length >= 2) return client.reply(from, 'Desculpe, este comando só pode ser usado com 1 pessoa.', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return client.reply(from, 'Maaf, user tersebut tidak menjadi admin.', id)
                await client.demoteParticipant(groupId, mentionedJidList[0])
                await client.sendTextWithMentions(from, `Pedido recebido, excluir trabalho @${mentionedJidList[0]}.`)
            break
        case '!apagar':

            if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id)
            if (!isGroupAdmins) return client.reply(from, 'Este recurso só pode ser usado por administradores de grupo', id)
            if (!quotedMsg) return client.reply(from, 'Errado !!, envie o comando *!apagar [marqueamensagem] *', id)
            if (!quotedMsgObj.fromMe) return client.reply(from, 'Errado !!, o bot não pode deletar o chat de outro usuário!', id)

                await client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break

        case '!ajuda':
        case '!help':
            await client.sendText(from, help)
            let batteryLevel = await client.getBatteryLevel()
            let isPlugged = await client.getIsPlugged(from)
            let connectionState = await client.getConnectionState()
            
            await client.reply(from, `----------------------\n*Status*: ${connectionState}\n*Bateria*: ${batteryLevel}%\n*Carregando*: ${(isPlugged) ? 'Sim' : 'Não' }\n----------------------`, id)   
            break
        }

    } catch (err) {

        await client.sendText(`Puts, deu merda... chama o @5531995360492 e mostra essa merda aqui.... ${err}`)

        console.log(color('[ERROR]', 'red'), err)
        client.kill().then(a => console.log(a))

    }

}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
      const info = urlParse(url);
      const httpClient = info.protocol === 'https:' ? https : http;
      const options = {
        host: info.host,
        path: info.path,
        headers: {
          'user-agent': 'WHAT_EVER',
        },
      };
  
      httpClient
        .get(options, (res) => {
          // check status code
          if (res.statusCode !== 200) {
            const msg = `request to ${url} failed, status code = ${res.statusCode} (${res.statusMessage})`;
            reject(new Error(msg));
            return;
          }
  
          const file = fs.createWriteStream(dest);
          file.on('finish', function () {
            // close() is async, call resolve after close completes.
            file.close(resolve);
          });
          file.on('error', function (err) {
            // Delete the file async. (But we don't check the result)
            fs.unlink(dest);
            reject(err);
          });
  
          res.pipe(file);
        })
        .on('error', reject)
        .end();
    });
  }
