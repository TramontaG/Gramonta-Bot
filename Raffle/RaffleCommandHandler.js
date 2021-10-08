const RaffleMaker = require('./Raffle');
const inputHandler = [];

inputHandler["-criar"] = (raffleId, raffleCreator) => {
    try {
        const newRaffle =  RaffleMaker.makeRaffle(raffleId, raffleCreator);
        if (newRaffle) return {
            responseType: "Success",
            data: `Novo sorteio! Digitem "!sorteio -participar ${raffleId}" para concorrer!`
        }
        else return {
            responseType: "Fail",
            data: "Erro desconhecido: Xingue o tramonta",
        }
    } catch (e) {
        return {
            responseType: "Fail",
            data: e,
        }
    }
}

inputHandler["-participar"] = (id, participant) => {
    try {
        RaffleMaker.addParticipant(id, participant);
        return {
            responseType: "Success",
            data: `Você está agora participando do sorteio do ${id}`
        }
    } catch (e) {
        return {
            responseType: "Fail",
            data: e,
        }
    }
}

inputHandler["-desistir"] = (id, participant) => {
    try {
        RaffleMaker.removeParticipant(id, participant);
        return {
            responseType: "Success",
            data: `Você está desistiu do sorteio do ${id}`
        }
    } catch (e) {
        return {
            responseType: "Fail",
            data: e,
        }
    }
}

inputHandler['-sortear'] = (id, caller) => {
    try {
        const winner = RaffleMaker.startRaffle(id, caller);
        return {
            responseType: "Success",
            data: `O vencedor do sorteio foi ${winner}, meus parabéns!`,
        }
    } catch (e) {
        return {
            responseType: "Fail",
            data: e,
        }
    }
}

inputHandler['-cancelar'] = (id, caller) => {
    try {
        RaffleMaker.cancelRaffle(id, caller);
        return {
            responseType: "Success",
            data: `O sorteio ${id} foi cancelado`,
        }
    } catch (e) {
        return {
            responseType: "Fail",
            data: e,
        }
    }
}

inputHandler['-default'] = (id, caller) => {
    try {
        throw `Metodo inválido. Utilize "-criar", "-participar", "-desistir", "-sortear", "-cancelar"`
    } catch (e) {
        return {
            responseType: "Fail",
            data: e,
        }
    }
}

module.exports = inputHandler;