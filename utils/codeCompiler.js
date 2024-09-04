const { Debug, Error } = require('./logging');

const axios = require('axios');
const qs = require('qs');

module.exports = async function compileCode(language, code) {
    const data = qs.stringify({
        'code': code,
        'language': language,
        'input': '7'
    });

    const config = {
        method: 'post',
        url: 'https://api.codex.jaagrav.in',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    try {
        const response = await axios(config);
        Debug(JSON.stringify(response.data.output));
        return response.data.output;
    } catch (error) {
        Error(error);
        throw new Error(`Failed to compile code: ${error.message}`);
    }
}
