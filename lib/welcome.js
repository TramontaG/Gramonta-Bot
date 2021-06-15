const fs = require('fs-extra')

module.exports = welcome = async (client, event) => {

    const welkom = JSON.parse(fs.readFileSync('./lib/welcome.json'))
    const isWelkom = welkom.includes(event.chat)

    try {

        if (event.action == 'add' && isWelkom) {

            const gChat = await client.getChatById(event.chat)
            const pChat = await client.getContact(event.who)
            const { contact, groupMetadata, name } = gChat
            const pepe = await client.getProfilePicFromServer(event.who)

            let chatNumber = pChat.id.split('-')
            let ddd = chatNumber[0].substring(2, 4)
            let number = chatNumber[0].substring(4, 12)

            dddPermitidos = [31, 32, 33, 34, 35, 37, 38]

            console.log(groupMetadata)

            if( dddPermitidos.includes(parseInt(ddd)) ){

                await client.sendText(event.chat, `Oi *novato(a)*, 👋 seja bem vindo(a) se apresente ao grupo...`, pChat.id)

            }else{

                await client.removeParticipant(event.chat, pChat.id)
                await client.sendText(event.chat, `DDD *${ddd}*, peeeega vai tomar ban...`)

            }

        }

        if (event.action == 'remove' && isWelkom) {

            const gif = await fs.readFileSync('./media/saiu.webp', { encoding: "base64" })
            await client.sendImageAsSticker(event.chat, `data:image/gif;base64,${gif.toString('base64')}`)

            //const { contact, groupMetadata, name } = gChat
            const gChat = await client.getChatById(event.chat)
            const pChat = await client.getContact(event.who)
            const pepe = await client.getProfilePicFromServer(event.who)
            const capt = `Tchau *${pChat?.name ? pChat?.shortName : 'desconhecido' }*👋 foi tarde...`

            await client.sendText(event.chat, capt)


        }

    } catch (err) {
        console.log(err)
    }
}
