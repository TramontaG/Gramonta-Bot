const zaplify = result => {
    const msgMap = {

        Search: ({data}) => {
            return data.reduce((msg, item, index) => {
                return msg += `${index +1} - ${item.title}\n`
            }, '');
        },

        Download: ({data}) => {
            return `Sucesso! ${data}`;
        }

    }

    return msgMap[result.responseType](result);

}

module.exports = zaplify;