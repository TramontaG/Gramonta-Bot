# Gramonta-Bot

## Overview:

O Gramonta-Bot é um bot de uso geral para whatsapp. Ele é construido em cima da lib [Wa-Automator-Node](https://github.com/open-wa/wa-automate-nodejs);

## Princípios:

O bot tem o objetivo de ser algo útil e divertido, jamais um incômodo. Por isso, algumas funcionalidades eu simplesmente me recuso a implementar. Eu JAMAIS vou fazer com que ele marque pessoas, mande mensagens no privado ou responda quando não-solicitado. A ferramenta que eu uso permite isso, mas eu não vou utilizar essas funcionaliades.

## Funcionalidades:

| Comando               | Descrição                                                           | API Keys           |
| --------------------- | ------------------------------------------------------------------- | ------------------ |
| !about                | Informações sobre o bot                                             |                    |
| !help                 | Informa todos os comandos                                           |                    |
| !admin                | Comandos de administrador do grupo                                  |                    |
| !bored                | Envia sugestões do que fazer quando estiver entediado               | Google             |
| !tia                  | Envia imagens de tia do zap                                         |                    |
| !copypasta            | Envia copypastas do acervo pessoal do bot                           |                    |
| !delete               | Faz com que o bot delete alguma mensagem que ele mesmo enviou       |                    |
| !dictionary [OFFLINE] | Significado de palavras                                             |                    |
| !finance [OFFLINE]    | Cotação de ações, câmbio de moedas, critpos, fundos e mais          | Alpha vantage / HG |
| !google               | Pesquisa na web, imagens e ainda fala com a voz da mulher do google | Google, OpenWa     |
| !horoscopo            | Horóscopo diário                                                    |                    |
| !log                  | Mostra relatório de dados da utilização do bot                      |                    |
| !lyrics               | Busca letras de músicas do genius                                   |                    |
| !meme                 | Cria memes usando a API do ImgFlip                                  | ImgFlip            |
| !offend               | Xinga um membro do grupo                                            |                    |
| !gpt [OFFLINE]        | Chat GPT no whatsapp                                                | OpenAi             |
| !patches              | Mostra os patch notes do bot                                        |                    |
| !ping                 | Responde pong. Só para ver se o bot está online                     |                    |
| !reset                | Restarta o bot. Só pode ser usado pelo dono do bot                  |                    |
| !reveal               | Revela imagens e videos de visualização única                       |                    |
| !s                    | Faz figurinhas                                                      |                    |
| !translate            | Traduz mensagens usando google tradutor                             | Google             |
| !weather              | Consulta o clima de qualquer cidade do mundo                        |                    |
| !wordle               | Jogar wordle diretamente no whatsapp                                |                    |
| !youtube              | Baixe videos do youtube em mp4 ou mp3                               | Youtube, OpenWa    |

# Setup do ambiente:

O bot é um simples projeto node. Para rodar seu bot, crie um arquivo .env na raíz do projeto e siga o mesmo modelo do arquivo .env.example. Adicione o nome do seu à env `BOT_NAME`, instale as dependências com `yarn` ou `npm install` e em seguida dê um start com `yarn start` ou `npm run start`.

Fique atento ao terminal pois na primeira vez que você rodar, aparecerá um QR-Code para você scanear e autenticar com o whatsapp. O processo é igual ao se autenticar com o whatsapp web (porque por baixo dos panos é isso que você está fazendo).

Caso queira desconectar o bot, você deve deslogar o dispositivo pelo celular e apagar as pastas `_IGNORE_${BOT_NAME}`, `.node-persist` e `${BOT_NAME}.data.json` da raíz do projeto.

Lembre-se de alterar o .gitignore para incluir o `${BOT_NAME}.data.json` e não commitar seus dados de sessão.

## Envs

O projeto usa várias envs com chaves de API que são importantes para o funcionamento do bot. Quais módulos utilizam quais envs estão descritos na tabela acima. É de responsabilidade de quem for clonar esse bot de gerar essas chaves e setá-las como envs de acordo.

- CLIENT_KEY: Chave de licensa do OpenWa. Importante para enviar os botões dos módulos do Google e Youtube.
- YOUTUBE_KEY: Usada para pesquisa no Youtube. Não é usada para baixar vídeos, apenas para pesquisa.
- GOOGLE_KEY: Usada para usar APIS do Google.
- GOOGLE_APPLICATION_CREDENTIALS= Path de um json que contém credenciais. O projeto espera um `googleAppCredentials.json` na raíz.
  GOOGLE_CSE_KEY= Chave da CustomSearchEngine do Google. Serve especificamente para procurar no Google.
- IMGFLIP_USERNAME e IMGFLIP_PASSWORD: Usuário e senha do ImgFlip para criar os memes.
- ALPHA_VINTAGE_API_KEY e HG_API_KEY: Usadas no módulo finance.
- OPENAI_API_KEY: Usada para o chat-gpt e dalle-2

# Como funcionam os comandos

Os comandos seguem todos uma mesma estrutura:

- Iniciam com `!`
- A primeira palavra é o nome do módulo
- A segunda palavra é o nome do método
- O restante são os argumentos do comando

Os argumentos do comando se dividem em

- Argumentos imediatos: Aquilo que vem logo após o nome do método
- Argumentos nomeados: Seguem a estrutura `-nomeDoArgumento valor do argumento`

Exemplo de comando: `!google image minecraft -imgamount 5`

- `google`: Módulo
- `image`: Método
- `minecraft`: Argumento imediato
- `-imgamount 5`: Argumento nomeado de nome `imgamount` e valor `5`

Caso o método não seja especificado, será subtendido o método `default`

Exemplo de comando: `!s`

- `s`: módulo
- `default`: Método (subtendido)

# Módulos

Os módulos são classes que possuem a funcionalidade de interagir com o whatsapp.

Para criar um módulo, crie uma classe que estende a classe `Module` exportada no arquivo `src/Modules/ModulesRegister.ts`

Os métodos dessa classe podem ser exportados para o whatsapp usando no construtor `this.makePublic(methodName, method)`, onde o `methodName` é como ele deve ser chamado no whatsapp e o `method` é o método da classe que será executado ao receber o comando em questão.

Esse método receberá dois argumentos:

- args: Objeto contendo todos os dados do comando já parseado
- requester: Objeto referente à mensagem do solicitante desse comando

### Exemplo mínimo de módulo:

```typescript
// src/modules/Greeter/index.ts

import { Message } from '@open-wa/wa-automate';
import { Args, Module } from '../ModulesRegister';

class Greeter extends Module {
	constructor() {
		super();
		this.makePublic('default', this.hello);
	}

	hello(_: Args, requester: Message) {
		this.zaplify.replyAuthor('hello!', requester);
	}
}

export default Greeter;
```

Mas há um problema: O bot ainda não conhece esse módulo. Você precisa especificar ao bot que esse módulo existe e dar um nome à ele.

Para isso, você deve inserir no arquivo `src/Modules/RegisteredModules/Zaplify/index.ts` uma nova entrada:

```typescript
// src/Modules/RegisteredModules/Zaplify/index.ts

import ModulesWrapper from '../../ModulesRegister';
const modulesWrapper = new ModulesWrapper();

//Adicionar o import do seu módulo "Greeter"
import Greeter from '../../Greeter';

// Registrar com o nome "hi" uma instância do seu módulo "Greeter";
modulesWrapper.registerModule('hi', new Hi());

export default modulesWrapper;
```

Agora você pode reiniciar o bot e toda vez que alguém mandar uma mensagem contendo `!hi` o bot responderá com `hello!`

# Contribuição:

Você pode abrir uma pull request com um módulo novo ou uma correção de bug. Basta manter os princípios do bot descritos no topo desse arquivo
