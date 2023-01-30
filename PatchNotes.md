> @latest

# [30/01/2023]

- Refeito módulo do horóscopo!
  Agora o módulo de horóscopo pode ser usado novamente.
  Basta digitar `!horoscopo` _seu signo_
  <br>

- Corrigido bug do parser de comandos que evitava que a primeira palavra possuisse acentuação
  O parser dava problema quando o usuário digitava algo como...
  `!weather são paulo`
  <br>

# [29/01/2023]

- Corrigido bug do módulo Weather!
  Antes, o módulo precisava inserir a palavra `"city"` para a consulta do clima da cidade
  <br>
  Exemplo:`!weather city rio de janeiro`
  <br>
  Quando eu removi a necessidade do "city", ele estava com um bug. Caso a cidade tivesse mais de uma palavra no nome, era necessário incluir city para a pesquisa ser feita
  <br>
- ✅`!weather curitiba       |` pesquisava por "curitiba"
- ❌`!weather rio de janeiro |` pesquisava por "de janeiro"
  <br>
  Esse bug foi corrigido.
  <br><br>

> ---

> @old

# [03/12/2022]

- Criado módulo Bored:
  Receba sugestões do que fazer quando estiver entediado!

  <br>
  <br>

# [01/12/2022]

Criado módulo da ofensa!

- Marque alguém para o bot ofender. Os xingamentos vem da API `http://xinga-me.appspot.com/api`
- Exemplo de uso: `!offend @pessoa`

<br>
  <br>

# [28/11/2022]

- **Adicionado módulo Admin**
  Por enquanto so possui o método ban
- Exemplo de uso: `!admin ban @pessoa`
  <br>
  <br>

# [27/11/2022]

- **Criado o módulo de parser dos arquivos .zap.md!!!!**
  Foi criado um parser de arquivos de texto estilizado do tipo Markdown específico para o bot do whatsapp.
  Agora o bot consegue ter todas as respostas das mensagens vindo de uma fonte externa ao código.
  Conforme o tempo vou refatorando o bot para eliminar todas as mensagens vindo de strings hard coded!
  Ele conta com uma injeção de valores por meio de template strings semelhantes à das linguagens de programação

    <br>

  **Para ver os patches anteriores, clique aqui: https://github.com/TramontaG/Gramonta-Bot/blob/main/PatchNotes.md**

- this should not appear

> ---
