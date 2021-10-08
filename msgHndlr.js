const { decryptMedia } = require('@open-wa/wa-decrypt');
const fs = require('fs-extra');
const axios = require('axios');
const moment = require('moment-timezone');
const color = require('./lib/color');
const { help } = require('./lib/help');
const welkom = JSON.parse(fs.readFileSync('./lib/welcome.json'));
const path = require('path');

const http = require('http');
const https = require('https');
const urlParse = require('url').parse;

const youtube = require('./youtube/youtubeCommandsHandler');
const YTZaplify = require('./youtube/YTZaplify');

const Raffle = require('./Raffle/RaffleCommandHandler');
const RaffleZaplify = require('./Raffle/RaffleZaplify');

const googleTTS = require('google-tts-api'); // CommonJS

const dialogflow = require('dialogflow');
const config = require('./config');

moment.tz.setDefault('America/Sao_Paulo').locale('pt-br');

const credentials = {
	client_email: config.GOOGLE_CLIENT_EMAIL,
	private_key: config.GOOGLE_PRIVATE_KEY,
};

const sessionClient = new dialogflow.SessionsClient({
	projectId: config.GOOGLE_PROJECT_ID,
	credentials,
});

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function sendToDialogFlow(msg, session, params) {
	let textToDialogFlow = msg;
	try {
		const sessionPath = sessionClient.sessionPath(config.GOOGLE_PROJECT_ID, session);

		const request = {
			session: sessionPath,
			queryInput: {
				text: {
					text: textToDialogFlow,
					languageCode: config.DF_LANGUAGE_CODE,
				},
			},
			queryParams: {
				payload: {
					data: params,
				},
			},
		};

		const responses = await sessionClient.detectIntent(request);
		const result = responses[0].queryResult;
		console.log('INTENT ENCONTRADO: ', result.intent.displayName);
		let defaultResponses = [];

		if (result.action !== 'input.unknown') {
			result.fulfillmentMessages.forEach((element) => {
				defaultResponses.push(element);
			});
		}

		if (defaultResponses.length === 0) {
			result.fulfillmentMessages.forEach((element) => {
				if (element.platform === 'PLATFORM_UNSPECIFIED') {
					defaultResponses.push(element);
				}
			});
		}

		result.fulfillmentMessages = defaultResponses;

		//console.log("se enviara el resultado: ", result);

		return result;
	} catch (e) {
		console.log('error');
		console.log(e);
	}
}

module.exports = msgHandler = async (client, message) => {
	try {
		const { urlParametro, type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message;
		let { body } = message;
		const { name, formattedTitle } = chat;
		let { pushname, verifiedName } = sender;
		pushname = pushname || verifiedName;
		const commands = caption || body || '';
		const falas = commands.toLowerCase();
		const command = commands.toLowerCase().split(' ')[0] || '';
		const args = commands.split(' ');

		const msgs = (message) => {
			if (command.startsWith('!')) {
				if (message.length >= 10) {
					return `${message.substr(0, 15)}`;
				} else {
					return `${message}`;
				}
			}
		};

		const mess = {
			wait: '⏳ Espera porra, já to fazendo a figurinha...',
			error: {
				St: '[❗] Envie uma imagem com uma legenda *!s* ou marque a imagem que já foi enviada',
			},
		};

		const time = moment(t * 1000).format('DD/MM HH:mm:ss');
		const botNumber = await client.getHostNumber();
		const blockNumber = await client.getBlockedIds();
		const groupId = isGroupMsg ? chat.groupMetadata.id : '';
		const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : '';
		const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false;
		const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false;
		const ownerNumber = ['+5531984928178@c.us', '+5531984928178']; // replace with your whatsapp number
		const isOwner = ownerNumber.includes(sender.id);
		const isBlocked = blockNumber.includes(sender.id);
		const uaOverride =
			'WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';
		const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi);
		if (!isGroupMsg && command.startsWith('!'))
			console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(msgs(command)), 'from', color(pushname));
		if (isGroupMsg && command.startsWith('!'))
			console.log(
				'\x1b[1;31m~\x1b[1;37m>',
				'[\x1b[1;32mEXEC\x1b[1;37m]',
				time,
				color(msgs(command)),
				'from',
				color(pushname),
				'in',
				color(formattedTitle)
			);
		//if (!isGroupMsg && !command.startsWith('!')) console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname))
		if (isGroupMsg && !command.startsWith('!'))
			console.log('\x1b[1;33m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color(body), 'from', color(pushname), 'in', color(formattedTitle));
		if (isBlocked) return;
		//if (!isOwner) return

		console.log('FROM ===>', color(pushname));
		console.log('ARGUMENTOS ===>', color(args));
		console.log('FALAS ====>', color(falas));
		console.log('COMANDO ====>', color(command));
		console.log('ALGUEM FALOU DE MIM =====>', color(falas.indexOf('bruce') != -1));

		let objeto = JSON.parse(await fs.readFileSync('./lib/dialogflowActive.json', { encoding: 'utf8', flag: 'r' }));

		if (objeto?.ativo == 'true') {
			const payload = await sendToDialogFlow(falas, from, 'params');
			const responses = payload?.fulfillmentMessages;

			console.log('RECEBEU DIALOGFLOW ======>', payload);
			for (const response of responses) {
				let randomIndex = Math.floor(Math.random() * response?.text?.text.length);
				await client.reply(from, `${response?.text?.text[randomIndex]}`, id);
			}
		}

		if (falas.indexOf('bruce') != -1 || falas.indexOf('oi bruce') != -1 || falas.indexOf('olá bruce') != -1) {
			await client.sendButtons(
				from,
				'Esse menu foi ativado, por que você falou o meu nome, em que posso ser útil?',
				[
					{
						id: 'id1',
						text: 'Menu do bot',
					},
					{
						id: 'id2',
						text: 'Quem sou eu?',
					},
					{
						id: 'id3',
						text: 'Nada, obrigado.',
					},
				],
				'Oi? ta falando de mim? Em que posso te ajudar?'
			);
		}

		switch (falas) {
			case 'me ajuda bot':
			case 'me ajuda':
			case 'bot me ajuda':
				await client.sendText(from, help);
				break;

			case '!berrante':
			case 'toca berrante':
			case 'toca o berrante':
			case 'bot toca berrante':
			case 'toca o berrante bot':
			case 'toca o berrante savio':
				await client.sendFile(from, './media/berrante.mpeg', 'Toca o berrante seu moço', 'AAAAAAAAAUHHH', id);
				break;

			case 'trem bala':
				await client.sendFile(from, './media/trembala.mpeg', 'Trem bala', 'AAAAAAAAAUHHH', id);
				break;

			case 'vamos acordar':
				await client.sendFile(from, './media/vamoacordar.mpeg', 'Vamos acordar porra', 'AAAAAAAAAUHHH', id);
				break;

			case 'bom dia':
				await client.sendFile(from, './media/bomdia.mpeg', 'Bom dia', 'AAAAAAAAAUHHH', id);
				break;

			case 'acorda corno':
				await client.sendFile(from, './media/acordaCorno.mpeg', 'Acorda corno', 'AAAAAAAAAUHHH', id);
				break;

			case 'acorda':
				await client.sendFile(from, './media/acorda.mpeg', 'Acorda', 'AAAAAAAAAUHHH', id);
				break;

			case 'garibalda sua safada':
				client.sendText(from, 'Esse comando foi desativado!', id);
				break;

			case 'sexto':
			case 'sextou':
			case 'sextô':
			case 'sextôu':
				if (moment().format('dddd') == 'sexta-feira') {
					await client.reply(from, 'ôpa, bora??', id);
					const gif1 = await fs.readFileSync('./media/sexto.webp', { encoding: 'base64' });
					await client.sendImageAsSticker(from, `data:image/gif;base64,${gif1.toString('base64')}`);
				} else {
					await client.reply(from, `Uai, hoje ainda e ${moment().format('dddd')} e você já ta procurando sexta-feira?....`, id);
				}

				break;

			case 'bot gay':
			case 'o bot é gay':
			case 'o bot é cuzao':
			case 'vai tomar no cu bot':
			case 'tomar no cu bot':
			case 'bot viado':
			case 'bot corno':
			case 'cu bot':
			case 'o bot viado':
			case 'bot otario':
			case 'o é bot otario':
			case 'fuder bot':
			case 'o bot otario':
			case 'bot lixo':
			case 'fodas bot':
			case 'vai se fuder bot':
			case 'vai se foder bot':
			case 'o bot lixo':
				await client.reply(from, 'É pra esculachar?...', id);
				const gif2 = await fs.readFileSync('./media/xingping.webp', { encoding: 'base64' });
				await client.sendImageAsSticker(from, `data:image/gif;base64,${gif2.toString('base64')}`);
				break;

			case 'bom dia bot':
				await client.reply(from, 'Bom dia? so se for pra você que dormiu a noite toda...', id);
				const gif3 = await fs.readFileSync('./media/tudosobcontrole.webp', { encoding: 'base64' });
				await client.sendImageAsSticker(from, `data:image/gif;base64,${gif3.toString('base64')}`);
				break;

			case 'boa tarde bot':
				await client.reply(from, `Boa tarde, são ${moment().format('HH:mm')} e vc ta ai atoa ne? ligando pro seu chefe...`, id);
				break;

			case 'boa noite bot':
				await client.reply(from, `Boa noite pra você também! já são ${moment().format('HH:mm')} to indo nessa também...`, id);
				break;

			case 'que dia e hoje bot':
			case 'que dia é hoje bot':
			case 'oi bot que dia é hoje?':
			case 'que dia e hoje?':
			case 'que dia é hoje?':
				await client.reply(from, `Tem calendário não? hoje é dia ${moment().format('DD/MM/YYYY HH:mm:ss')}`, id);
				break;

			case 'que dia e hoje bot ?':
			case 'que dia é hoje bot ?':
			case 'que dia e hoje ?':
			case 'que dia é hoje ?':
				await client.reply(
					from,
					`Tira o espaço entre o texto e virgula, e vc não tem calendário não? hoje é dia ${moment().format('DD/MM/YYYY HH:mm:ss')}`,
					id
				);
				break;

			case 'oi bot':
				await client.reply(from, 'Fala? que ta pegando? sei fazer algumas coisas, digite: *me ajuda*', id);
				break;

			case 'como vc está bot?':
			case 'como vai bot?':
			case 'bot como vc está?':
			case 'bot como vai?':
			case 'oi bot como vai?':
			case 'bot como vc esta?':
			case 'oi bot como vc esta?':
			case 'oi bot como vc ta?':
				const gif99 = await fs.readFileSync('./media/tranquilao.webp', { encoding: 'base64' });
				await client.sendImageAsSticker(from, `data:image/gif;base64,${gif99.toString('base64')}`);
				break;

			case 'fala bot':
				await client.reply(from, 'Fala você... ou digite: !ajuda', id);
				const gif4 = await fs.readFileSync('./media/pensando.webp', { encoding: 'base64' });
				await client.sendImageAsSticker(from, `data:image/gif;base64,${gif4.toString('base64')}`);
				break;
		}

		switch (command) {
			case '!dialogflow':
				if (args.length === 1) return client.reply(from, 'Escolha habilitar ou desabilitar!', id);
				if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id);

				if (args[1].toLowerCase() === 'enable') {
					await fs.writeFileSync('./lib/dialogflowActive.json', JSON.stringify({ ativo: 'true' }));
					await client.reply(from, 'O dialogflow ativado com sucesso.', id);
				} else {
					await fs.writeFileSync('./lib/dialogflowActive.json', JSON.stringify({ ativo: 'false' }));
					await client.reply(from, 'O dialogflow desabilitado com sucesso.', id);
				}

				break;

			case 'y0':
				if (typeof teste != 'undefined') {
					await client.sendText(from, `Copie e cole`, id);
					await client.sendText(from, `${teste[0]}`, id);
				} else {
					await client.sendText(from, `Pesquise algo para começar...`, id);
				}
				break;
			case 'y1':
				if (typeof teste != 'undefined') {
					await client.sendText(from, `Copie e cole`, id);
					await client.sendText(from, `${teste[1]}`, id);
				} else {
					await client.sendText(from, `Pesquise algo para começar...`, id);
				}
				break;
			case 'y2':
				if (typeof teste != 'undefined') {
					await client.sendText(from, `Copie e cole`, id);
					await client.sendText(from, `${teste[2]}`, id);
				} else {
					await client.sendText(from, `Pesquise algo para começar...`, id);
				}
				break;
			case 'y3':
				if (typeof teste != 'undefined') {
					await client.sendText(from, `Copie e cole`, id);
					await client.sendText(from, `${teste[3]}`, id);
				} else {
					await client.sendText(from, `Pesquise algo para começar...`, id);
				}
				break;
			case 'y4':
				if (typeof teste != 'undefined') {
					await client.sendText(from, `Copie e cole`, id);
					await client.sendText(from, `${teste[4]}`, id);
				} else {
					await client.sendText(from, `Pesquise algo para começar...`, id);
				}
				break;
			case 'y5':
				if (typeof teste != 'undefined') {
					await client.sendText(from, `Copie e cole`, id);
					await client.sendText(from, `${teste[5]}`, id);
				} else {
					await client.sendText(from, `Pesquise algo para começar...`, id);
				}
				break;

			case '!concursos':
			case '!concurso':
				if (args.length === 1) return client.reply(from, 'Preciso de um estado para localizar os concursos...', id);

				let request = await axios.get(
					`https://especiais.g1.globo.com/economia/concursos-e-emprego/lista-de-concursos-publicos-e-vagas-de-emprego/data/data.json`
				);
				let cidadeConcurso = body.split('.');
				let concursos = request?.data?.docs;

				encontrado = ``;
				quantidade = 0;
				console.log(concursos);

				concursos.forEach(async (data) => {
					if (String(data?.estado.toLowerCase()) == String(cidadeConcurso[1].toLowerCase())) {
						quantidade++;
						encontrado += `\n*Status*: ${data?.tipo}\n*Instituicao:* ${data?.instituicao}\n*Inicio:* ${
							data?.inicio ? data?.inicio + '/' : 'Sem previsão'
						} *Fim:* ${data?.encerramento}\n*Vagas:* ${data?.vagas}\n*Salário:* ${data?.salario}\n*Escolaridade:* ${data.escolaridade}\n*Local:* ${
							data.local
						} / *Estado:* ${data.estado}\n*Link:* ${data.link}\n-------\n`;
					}
				});

				await client.reply(from, `Pera ai, procurei no G1 e encontrei ${quantidade} concursos...`, id);
				setTimeout(() => client.reply(from, `${encontrado}`, id), 5000);

				break;
			case '!hacknumero':
				//if (!isGroupMsg) return client.reply(from, 'Este recurso não pode ser usado em grupos', id)
				if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id);
				if (args.length === 1) return client.reply(from, 'Preciso de um número pra localizar...', id);

				let numeroTracker = body.split('.');

				if (typeof numeroTracker[1] == 'undefined') {
					return await client.reply(from, `Coloca um . antes do número`, id);
				}

				await client.reply(from, `*Buscando alvo:* ${numeroTracker[1]}`, id);

				setTimeout(async () => {
					let requestNumero = await axios.get(`http://20.195.194.176/kiny/telefone/api.php?telefone=${numeroTracker[1]}`);
					let dadosEncontrados = requestNumero?.data;
					let resposta = String(dadosEncontrados); //.replace(/<br\s*\/?>/gi, "\n").replace(/<p>/gi, "");

					console.log('AQUI ===>', resposta);

					if (resposta.length > 87) {
						await client.reply(from, `💀 *Pera ai ...*\n Encontrei isso HAHAHAHAHAHA..`, id);
						await client.reply(from, `${resposta}`, id);
					} else {
						await client.reply(from, `💀 *Sorte sua, não encontrei nada ${numeroTracker[1]}*`, id);
					}
				}, 5000);

				break;
			case '!tts':
			case 'tts!':
				if (args.length === 1) return client.reply(from, 'Como eu vou adivinhar o devo buscar?', id);
				let string = body.split(' ').slice(1).join(' ');
				console.log('TTS STRING => ', string);
				if (string.length >= 200) {
					client.reply(from, `Porra bisho q treco grande, quer me bugar??`, id);
					break;
				}
				url = await googleTTS.getAudioUrl(`${string}`, {
					lang: 'pt_BR',
					slow: false,
					host: 'https://translate.google.com',
				});

				const dest = await path.resolve(__dirname, './media/to/translate.mp3'); // file destination
				await downloadFile(url, dest);
				await client.sendFile(from, './media/to/translate.mp3', 'translate', 'AAAAAAAAAUHHH', id);
				break;

			case '!sorteio':
				try {
					if (args.length === 1) return client.reply(from, 'Como eu vou adivinhar o devo fazer?', id);

					const command = args[1].toLowerCase();
					const stringTail = args.slice(2)[0]?.toLowerCase();
					const number = '@' + from.split('-')[0];
					const RaffleComamand = Raffle[command] || Raffle['-default'];

					const raffleResponse = RaffleComamand(stringTail, pushname || number, isGroupAdmins);

					client.reply(from, RaffleZaplify(raffleResponse), id);
				} catch (e) {
					client.reply(from, `Deu merda no sorteio man, mostra isso aq pro tramonta...\n ${e}`, id);
				}

				break;

			case '!yt':
			case '!youtube':
			case '!mp3':
				try {
					if (args.length === 1) return client.reply(from, 'Como eu vou adivinhar o devo fazer?', id);

					const command = args[1];
					const stringTail = args.slice(2).join(' ');

					const YTResponse = await (youtube[command] || youtube.default)(stringTail, {
						onFinished: (err, data) => {
							client.sendFile(from, data?.file, '', 'AAAAAAAAAUHHH', id);
						},
						onProgres: (info) => console.log(info),
						onError: (error) => client.reply(from, `Mano, deu pau. Manda esse erro aqui pro Tramonta:\n${error}`),
					});

					client.reply(from, YTZaplify(YTResponse), id);
				} catch (e) {
					client.reply(from, `Deu merda man, mostra isso aq pro tramonta...\n${JSON.stringify(e)}`, id);
				}
				break;

			case '!horoscopo':
			case '!horóscopo':
				if (args.length === 1) return client.reply(from, 'Como eu vou adivinhar o horoscopo?', id);
				await client.reply(from, 'Buscando o horoscopo... pera um pouco', id);

				let horoscopo = await axios.get(`https://horoscopefree.herokuapp.com/daily/pt/`);
				const { publish, language, aries, taurus, gemini, cancer, leo, scorpio, libra, sagittarius, capricorn, aquarius, pisces, virgo } =
					horoscopo.data;
				switch (args[1]) {
					case 'aries':
						await client.sendText(from, `${aries}`);
						break;
					case 'touro':
						await client.sendText(from, `${taurus}`);
						break;
					case 'gemios':
					case 'gêmios':
						await client.sendText(from, `${gemini}`);
						break;
					case 'cancer':
					case 'câncer':
						await client.sendText(from, `${cancer}`);
						break;
					case 'leao':
					case 'leão':
						await client.sendText(from, `${leo}`);
						break;
					case 'escorpiao':
					case 'escorpião':
						await client.sendText(from, `${scorpio}`);
						break;
					case 'libra':
						await client.sendText(from, `${libra}`);
						break;
					case 'sagitario':
					case 'sagitário':
						await client.sendText(from, `${sagittarius}`);
						break;
					case 'capricornio':
						await client.sendText(from, `${capricorn}`);
						break;
					case 'aquario':
					case 'aquário':
						await client.sendText(from, `${aquarius}`);
						break;
					case 'peixes':
						await client.sendText(from, `${pisces}`);
					case 'virgem':
						await client.sendText(from, `${virgo}`);
						break;
					default:
						await client.sendText(from, `Não encontrei nada...`);
				}
				break;

			case '!limpeza':
				if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos!', id);
				if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado pelo grupo Admin!', id);

				await client.reply(from, `Buscando informações... pera ai`, id);
				const membros = await client.getGroupMembers(groupId);
				const grupo = await client.getGroupInfo(groupId);

				myArray = [];
				texto = '';
				membros.forEach(async (data, index) => {
					myArray.push({
						id: data?.id,
						name: data?.name,
						shortName: data?.shortName,
						formattedName: data?.formattedName,
						isMe: data?.isMe,
						isMyContact: data?.isMyContact,
						isPSA: data?.isPSA,
						isUser: data?.isUser,
						isWAContact: data?.isWAContact,
					});

					let numero = data?.id.split('@');
					texto += `\n*Número*: ${numero[0]}\n*É corporativo?* ${data?.isBusiness ? 'Sim' : 'Não'}\n-------------`;
				});

				let blocks = await client.getBlockedIds(id);

				await client.reply(from, `-------------\n*Grupo:* ${grupo?.title}\n*Bloqueados:* ${blocks.length || '0'}\n-------------\n${texto}`, id);

				break;

			case '!buscamemes':
			case '!buscameme':
				await client.reply(from, `Vasculhando a internet... pera um pouco`, id);

				let meme = await axios.get(`https://api.imgflip.com/get_memes`);

				myArray = [];
				meme?.data?.data?.memes.forEach(async (data, index) => {
					myArray.push({ url: data?.url, id: data?.id, name: data?.name });
					myArray = myArray.sort(() => Math.random() - 0.5);
				});

				myArray.forEach(async (data, index) => {
					urlRandom = myArray[Math.floor(Math.random() * myArray.length)];
					if (index < 6) {
						await client.sendImage(from, `${urlRandom?.url}`, `bot do jhon`, `*ID:* ${urlRandom?.id}\n*REF:* ${urlRandom?.name}`);
					}
				});

				break;

			case '!escrevememe':
				if (args.length === 1)
					return client.reply(from, 'Preciso de 2 textos e o ID da imagem para montar o meme... procure uma imagem !buscameme', id);

				let queryMeme = body.split('.');
				if (queryMeme.length <= 3) return client.reply(from, 'Preciso de todos os parametros para montar o meme', id);

				if (queryMeme[1].length == 0) return client.reply(from, 'Preciso do texto 1...', id);
				if (queryMeme[2].length == 0) return client.reply(from, 'Preciso do texto 2...', id);
				if (queryMeme[3].length == 0 && queryMeme[3].length <= 3) return client.reply(from, 'Preciso de um ID...', id);

				let text0 = queryMeme[1] ?? 'Como eu vou adivinhar';
				let text1 = queryMeme[2] ?? 'O que devo escrever?';
				let text2 = queryMeme[3] ?? '91545132';

				let dataSend = `text0=${encodeURIComponent(text0)}&text1=${encodeURIComponent(text1)}&template_id=${text2}&username=${encodeURIComponent(
					'jhowjhoe'
				)}&password=${encodeURIComponent('sdVKRA2QZm9fQx!')}`;
				let makeMeme = await axios({
					method: 'post',
					url: 'https://api.imgflip.com/caption_image',
					data: dataSend,
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				});

				if (makeMeme?.data?.success != true) return client.reply(from, `${makeMeme?.data?.error_message}`, id);
				await client.sendImage(
					from,
					`${makeMeme?.data?.data?.url}`,
					`bot do jhon`,
					`Pronto, meme gerado com sucesso. você pode visualizar ele aqui nesse site ${makeMeme?.data?.data?.page_url}`
				);

				break;

			case '!clima':
				if (args.length === 1) return client.reply(from, 'Ainda não adivinho coisas... preciso saber a cidade também', id);

				if (typeof args[1] == 'undefined') {
					return await client.reply(from, `Coloca um . antes da cidade`, id);
				}

				let cidade = body.split('.');
				console.log(typeof cidade[1]);

				if (typeof cidade[1] !== 'undefined') {
					if (cidade[1].length == 0) return client.reply(from, 'Preciso de uma cidade...', id);

					await client.reply(from, `Verificando com São Pedro como está o clima em ${cidade[1]}... pera um pouco`, id);

					let clima = await axios.get(`https://weather.contrateumdev.com.br/api/weather/city/?city=${encodeURI(cidade[1])}`);

					if (clima?.data?.cod == '404') return await client.reply(from, `Uai... ${clima?.data?.message}`, id);

					await client.sendText(
						from,
						`*Temperatura:* ${clima?.data?.main?.temp} ºC \n*Sensação térmica:* ${clima?.data?.main?.feels_like} ºC \n*Temperatura mínima:* ${clima?.data?.main?.temp_min} ºC \n*Temperatura máxima:* ${clima?.data?.main?.temp_max} ºC \n*Pressão atmosférica:* ${clima?.data?.main?.pressure}\n*Umidade:* ${clima?.data?.main?.humidity}%
----------------------\n${clima?.data?.name} - lat: ${clima?.data?.coord?.lat} lon: ${clima?.data?.coord?.lon}
                `
					);
				} else {
					return client.reply(from, 'Preciso de uma cidade...', id);
				}

				break;
			case '!bateria':
				let level = await client.getBatteryLevel();
				await client.reply(from, `----------------------\nNível de bateria é de: ${JSON.stringify(level)}%\n----------------------`, id);
				break;

			case '!cep':
				if (args.length === 1) return client.reply(from, 'Como eu vou adivinhar o cep?', id);

				let response = await axios.get(`https://viacep.com.br/ws/${args[1]}/json/`);
				const { logradouro, bairro, localidade, siafi, ibge } = response.data;

				await client.reply(from, 'Buscando o CEP... pera um pouco', id);
				await client.sendText(from, `🌎️ Rua: ${logradouro}, ${bairro}, ${localidade}\nSiafi: ${siafi}, Ibge: ${ibge} `);

				break;

			case '!jogodavelha':
				await client.reply(from, 'Eu ainda estou aprendendo isso, tem um preview...', id);

				let play1 = from;
				console.log(`PLAY 1 ===>`, play1);

				if (mentionedJidList.length === 0) return client.reply(from, 'Para usar este comando, envie o comando *!jogarjogovelha* @tagmember', id);
				for (let i = 0; i < mentionedJidList.length; i++) {
					//if (groupAdmins.includes(mentionedJidList[i])) return client.reply(from, mess.error.Ki, id)

					console.log(`PLAY ${i} ===>`, mentionedJidList[i]);
					play2 = mentionedJidList[i];
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
				await client.sendText(from, `1 2 3\n4 5 6\n7 8 9`);
				await client.sendText(from, ` *${play1}* x *${play2}*\nPor quem vamos começar?`);

				await client.reply(from, 'Isso é tudo..', id);

				break;

			case '!meunumero':
				let chatNumber = sender.id.split('-');
				let ddd = chatNumber[0].substring(2, 4);
				let number = chatNumber[0].substring(4, 12);

				client.reply(from, `Seu numero é: *${number}* seu ddd é: *${ddd}*`, id);

				break;

			case '!kickme':
				client.reply(from, 'Agooora! kkkk', id);

				await client.removeParticipant(groupId, sender.id);

				break;
			case '!sticker':
			case '!stiker':
			case '!s':
				if (isMedia && type === 'image') {
					const mediaData = await decryptMedia(message, uaOverride);
					const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`;
					await client.sendImageAsSticker(from, imageBase64, { author: 'Bot do JhowJhoe', pack: 'PackDoBot', keepScale: true });
				} else if (quotedMsg && quotedMsg.type == 'image') {
					const mediaData = await decryptMedia(quotedMsg, uaOverride);
					const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`;
					await client.sendImageAsSticker(from, imageBase64, { author: 'Bot do JhowJhoe', pack: 'PackDoBot', keepScale: true });
				} else if (args.length === 2) {
					const url = args[1];
					if (url.match(isUrl)) {
						await client.sendStickerfromUrl(from, url, { method: 'get' }).catch((err) => console.log('Caught exception: ', err));
					} else {
						client.reply(from, mess.error.Iv, id);
					}
				} else {
					client.reply(from, mess.error.St, id);
				}
				break;
			case '!stickergif':
			case '!stikergif':
			case '!sg':
			case '!sgif':
				if (isMedia) {
					if ((mimetype === 'video/mp4' && message.duration < 30) || (mimetype === 'image/gif' && message.duration < 30)) {
						const mediaData = await decryptMedia(message, uaOverride);
						client.reply(from, 'Já to fazendo a figurinha...', id);

						await client.sendMp4AsSticker(from, `data:${mimetype};base64,${mediaData.toString('base64')}`, null, {
							stickerMetadata: true,
							author: 'Bot do JhowJhoe',
							pack: 'PackDoBot',
							fps: 10,
							square: '512',
							loop: 0,
						});
					} else client.reply(from, 'Envie o gif com a legenda *!sg* máx. 30 segundos!', id);
				}
				break;
			case '!modoadm':
			case '!autoadm':
				if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos!', id);
				if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado pelo grupo Admin!', id);
				if (args.length === 1) return client.reply(from, 'Escolha habilitar ou desabilitar!', id);

				if (args[1].toLowerCase() === 'enable') {
					welkom.push(chat.id);
					fs.writeFileSync('./lib/welcome.json', JSON.stringify(welkom));
					await client.reply(from, 'O modo auto-adm foi ativado com sucesso neste grupo!', id);
				} else {
					welkom.splice(chat.id, 1);
					fs.writeFileSync('./lib/welcome.json', JSON.stringify(welkom));
					await client.reply(from, 'O recurso de auto-adm foi desabilitado com sucesso neste grupo!', id);
				}

				break;

			case '!linkdogrupo':
			case '!lg':
				if (!isBotGroupAdmins) return client.reply(from, 'Este comando só pode ser usado quando o bot se torna administrador', id);
				if (isGroupMsg) {
					const inviteLink = await client.getGroupInviteLink(groupId);
					client.sendLinkWithAutoPreview(from, inviteLink, `\nLink do grupo: *${name}*`);
				} else {
					client.reply(from, 'Este comando só pode ser usado em grupos!', id);
				}
				break;

			case '!adminlista':
				if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos!', id);
				let mimin = '';
				for (let admon of groupAdmins) {
					mimin += `➸ @${admon.replace(/@c.us/g, '')}\n`;
				}
				await client.sendTextWithMentions(from, mimin);
				break;

			case '!donodogrupo':
				if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos!', id);
				const Owner_ = chat.groupMetadata.owner;
				await client.sendTextWithMentions(from, `Dono do grupo: @${Owner_}`);
				break;

			case '!mencionartodos':
				if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos!', id);
				if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id);
				const groupMem = await client.getGroupMembers(groupId);
				let hehe = '╔══✪〘 Chamada geral 〙✪══\n';
				for (let i = 0; i < groupMem.length; i++) {
					hehe += '╠➥';
					hehe += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`;
				}
				hehe += '╚═〘 Verificação de inatividade 〙';
				await client.sendTextWithMentions(from, hehe);
				break;

			case '!deixartudo':
				if (!isOwner) return client.reply(from, 'Este comando é apenas para o dono do bot', id);
				const allChats = await client.getAllChatIds();
				const allGroups = await client.getAllGroups();
				for (let gclist of allGroups) {
					await client.sendText(gclist.contact.id, `Os bots estão limpando, o bate-papo total está ativo: ${allChats.length}`);
					await client.leaveGroup(gclist.contact.id);
				}
				client.reply(from, 'Sucesso!', id);
				break;

			case '!limpartudo':
				if (!isOwner) return client.reply(from, 'Este comando é apenas para o dono do bot', id);
				const allChatz = await client.getAllChats();
				for (let dchat of allChatz) {
					await client.deleteChat(dchat.id);
				}
				client.reply(from, 'Sucesso!', id);
				break;

			case '!adicionar':
			case '!add':
				const orang = args[1];
				if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id);
				if (args.length === 1) return client.reply(from, 'Para usar este recurso, envie o comando *!adicionar* 55319xxxxx', id);
				if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id);
				if (!isBotGroupAdmins) return client.reply(from, 'Este comando só pode ser usado quando o bot se torna administrador', id);
				try {
					await client.addParticipant(from, `${orang}@c.us`);
				} catch {
					await client.reply(from, mess.error.Ad, id);
				}
				break;

			case '!ban':
				if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id);
				if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id);
				if (!isBotGroupAdmins) return client.reply(from, 'Este comando só pode ser usado quando o bot se torna administrador', id);

				if (mentionedJidList.length === 0) return client.reply(from, 'Para usar este comando, envie o comando *!ban* @tagmember', id);
				await client.sendText(from, `Pronto! removido \n${mentionedJidList.join('\n')}`);

				for (let i = 0; i < mentionedJidList.length; i++) {
					if (groupAdmins.includes(mentionedJidList[i])) return client.reply(from, mess.error.Ki, id);

					console.log('BANIDO ===>', mentionedJidList[i]);
					await client.removeParticipant(groupId, mentionedJidList[i]);
				}
				break;

			case '!sair':
				if (!isGroupMsg) return client.reply(from, 'Este comando só pode ser usado em grupos', id);
				if (!isGroupAdmins) return client.reply(from, 'Este comando só pode ser usado por administradores de grupo', id);
				await client.sendText(from, 'Sayonara').then(() => client.leaveGroup(groupId));
				break;

			case '!promover':
				if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id);
				if (!isGroupAdmins) return client.reply(from, 'Este recurso só pode ser usado por administradores de grupo', id);
				if (!isBotGroupAdmins) return client.reply(from, 'Este recurso só pode ser usado quando o bot se torna administrador', id);
				if (mentionedJidList.length === 0) return client.reply(from, 'Para usar este recurso, envie o comando *!promover* @tagmember', id);
				if (mentionedJidList.length >= 2) return client.reply(from, 'Desculpe, este comando só pode ser usado por 1 usuário.', id);
				if (groupAdmins.includes(mentionedJidList[0])) return client.reply(from, 'Desculpe, o usuário já é um administrador.', id);
				await client.promoteParticipant(groupId, mentionedJidList[0]);
				await client.sendTextWithMentions(from, `Comando aceito, adicionado @${mentionedJidList[0]} como admin.`);
				break;

			case '!rebaixar':
				if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id);
				if (!isGroupAdmins) return client.reply(from, 'Este recurso só pode ser usado por administradores de grupo', id);
				if (!isBotGroupAdmins) return client.reply(from, 'Este recurso só pode ser usado quando o bot se torna administrador', id);
				if (mentionedJidList.length === 0) return client.reply(from, 'Para usar este recurso, envie o comando *!rebaixar* @tagadmin', id);
				if (mentionedJidList.length >= 2) return client.reply(from, 'Desculpe, este comando só pode ser usado com 1 pessoa.', id);
				if (!groupAdmins.includes(mentionedJidList[0])) return client.reply(from, 'Maaf, user tersebut tidak menjadi admin.', id);
				await client.demoteParticipant(groupId, mentionedJidList[0]);
				await client.sendTextWithMentions(from, `Pedido recebido, excluir trabalho @${mentionedJidList[0]}.`);
				break;
			case '!apagar':
				if (!isGroupMsg) return client.reply(from, 'Este recurso só pode ser usado em grupos', id);
				if (!isGroupAdmins) return client.reply(from, 'Este recurso só pode ser usado por administradores de grupo', id);
				if (!quotedMsg) return client.reply(from, 'Errado !!, envie o comando *!apagar [marqueamensagem] *', id);
				if (!quotedMsgObj.fromMe) return client.reply(from, 'Errado !!, o bot não pode deletar o chat de outro usuário!', id);

				await client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false);
				break;

			case '!ajuda':
			case '!menu':
			case '!help':
				await client.sendText(from, help);
				let batteryLevel = await client.getBatteryLevel();
				let isPlugged = await client.getIsPlugged(from);
				let connectionState = await client.getConnectionState();

				await client.reply(
					from,
					`----------------------\n*Status*: ${connectionState}\n*Bateria*: ${batteryLevel}%\n*Carregando*: ${
						isPlugged ? 'Sim' : 'Não'
					}\n----------------------`,
					id
				);
				break;

			case '':
				break;

			case '!xagc':
			case '!agro':
				let sendAgro = await axios.get(`https://api.pancakeswap.info/api/v2/tokens/0xd80bea63a208770e1c371dfbf70cb13469d29ae6`);
				let dadosEncontradosAgro = sendAgro;
				let priceformatAgro = (dadosEncontradosAgro.data.data.price * 1).toFixed(9);

				await client.reply(
					from,
					`Nome: ${dadosEncontradosAgro.data.data.name}\nToken: ${dadosEncontradosAgro.data.data.symbol}\nPreço: ${priceformatAgro}`,
					id
				);

				break;

			case '!price':
				/* if (args.length === 1) return client.reply(from, 'Digite !price .contrato (Ex: bscscan.com/token/>>>0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c<<<)', id)

                let contrato = body.split('.')

                let send = await axios.get(`https://api.pancakeswap.info/api/v2/tokens/${contrato[1]}`)
                let dadosEncontrados = send;
                let priceformat = (dadosEncontrados.data.data.price * 1).toFixed(9);

                await client.reply(from, `Nome: ${dadosEncontrados.data.data.name}\nToken: ${dadosEncontrados.data.data.symbol}\nPreço: ${priceformat}`, id) */

				/* url: "https://api.lunarcrush.com/v2?data=assets&key=pow9wvn4xxte3do4az7vq&symbol=" + token */

				try {
					if (args.lenght < 10) {
						if (args.length === 1)
							return client.reply(from, 'Digite !price .contrato (Ex: bscscan.com/token/>>>0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c<<<)', id);
						let contrato = body.split('.');
						let send = await axios.get(`https://api.pancakeswap.info/api/v2/tokens/${contrato[1]}`);
						let dadosEncontrados = send;
						let priceformat = (dadosEncontrados.data.data.price * 1).toFixed(9);

						await client.reply(
							from,
							`Nome: ${dadosEncontrados.data.data.name}\nToken: ${dadosEncontrados.data.data.symbol}\nPreço: ${priceformat}`,
							id
						);
					} else {
						if (args.length === 1) return client.reply(from, 'Digite !price .ETH', id);
						let parametroLunar = body.split('.');
						let moedaLunar = parametroLunar[1];
						let sendLunar = await axios.get(`https://api.lunarcrush.com/v2?data=assets&key=pow9wvn4xxte3do4az7vq&symbol=${moedaLunar}`);
						let dadosEncontradosLunar = sendLunar;

						await client.reply(
							from,
							`Nome: ${dadosEncontradosLunar['data']['data'][0]['name']}\nPreço: ${dadosEncontradosLunar['data']['data'][0]['price']}\nMarketCap: ${dadosEncontradosLunar['data']['data'][0]['market_cap']}\nVolume 24h: ${dadosEncontradosLunar['data']['data'][0]['volume_24h']}\nMax Supply: ${dadosEncontradosLunar['data']['data'][0]['max_supply']}\n`,
							id
						);
					}
				} catch (error) {
					console.error(error);
					await client.reply(from, `Moeda não encontrada!`, id);
				}

				break;

			case '!moeda':
			case '!converter':
			case '!cot':
			case '!cotacao':
				if (args.length === 1) return client.reply(from, 'Digite !converter .BTCxUSD', id);
				let parametro = body.split('.');
				let moeda = parametro[1];

				parametroBusca = moeda.split('x');

				try {
					console.log(parametroBusca[0]);
					console.log(parametroBusca[1]);

					console.error(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${parametroBusca[0]}&convert=${parametroBusca[1]}`);

					let coinmarketcap = await axios({
						method: 'GET',
						url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${parametroBusca[0]}&convert=${parametroBusca[1]}`,
						headers: { 'Content-Type': 'application/json', 'X-CMC_PRO_API_KEY': 'b2776f73-fbda-4b91-8d8b-221be52eb5ff' },
					});

					let coinmarketcapData = coinmarketcap?.data?.data;

					let textoSend = `*Nome:* ${coinmarketcapData[parametroBusca[0]].name}\n*Ranking:* ${
						coinmarketcapData[parametroBusca[0]].cmc_rank != null ? coinmarketcapData[parametroBusca[0]].cmc_rank : 'Sem posição'
					}\n*Sigla:* ${coinmarketcapData[parametroBusca[0]].symbol}\n*Preço:* ${parseFloat(
						coinmarketcapData[parametroBusca[0]].quote[parametroBusca[1]].price
					).toLocaleString('pt-br', { style: 'currency', currency: `${parametroBusca[1]}` })}\n*Volume 24h:* ${parseFloat(
						coinmarketcapData[parametroBusca[0]].quote[parametroBusca[1]].volume_24h
					).toLocaleString('pt-br', { style: 'currency', currency: `${parametroBusca[1]}` })}\n*Suprimento máximo:* ${
						coinmarketcapData[parametroBusca[0]].max_supply != null
							? parseFloat(coinmarketcapData[parametroBusca[0]].max_supply).toLocaleString('pt-br', {
									style: 'currency',
									currency: `${parametroBusca[1]}`,
							  })
							: 'R$ 0,00'
					}\n*Suprimento circulante:* ${parseFloat(coinmarketcapData[parametroBusca[0]].circulating_supply).toLocaleString('pt-br', {
						style: 'currency',
						currency: `${parametroBusca[1]}`,
					})}\n*Suprimento total:* ${parseFloat(coinmarketcapData[parametroBusca[0]].total_supply).toLocaleString('pt-br', {
						style: 'currency',
						currency: `${parametroBusca[1]}`,
					})}\n*Atualização:* ${coinmarketcapData[parametroBusca[0]].quote[parametroBusca[1]]?.last_updated}\n`;

					await client.reply(from, `${textoSend}`, id);
				} catch (error) {
					console.error(error);
					await client.reply(from, `Não achei essa moeda... *${parametroBusca[0]}*, cuidado ao investir!`, id);
				}

				break;
		}
	} catch (err) {
		await client.sendText(`Puts, deu merda... chama o @5531995360492 e mostra essa merda aqui.... ${err}`);

		console.log(color('[ERROR]', 'red'), err);
		client.kill().then((a) => console.log(a));
	}
};

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
