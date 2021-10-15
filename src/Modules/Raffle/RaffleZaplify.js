const zaplify = result => {
    const msgMap = {

        Success: ({data}) => {
            return data;
        },

        Fail: ({data}) => {
            return `Erro: ${data}`;
        }

    }
    console.log(result);

    console.log("RESPONSE TYPE", result.responseType);
    console.log("FUNCTION?? ", msgMap[result.responseType]);

    return msgMap[result.responseType](result);

}

module.exports = zaplify;