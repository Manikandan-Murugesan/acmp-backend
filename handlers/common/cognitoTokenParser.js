function getUserId(token) {
    var usernameValue = '';
    try {
        var segments = token.split('.');
        if (segments.length !== 3) {
            throw new Error('Not enough or too many segments');
        }
        var payloadSeg = segments[1];
    
        var payload = JSON.parse(_base64urlDecode(payloadSeg));
        
        usernameValue = payload['cognito:username']

    } catch (e) {
        console.log(e);
    }
    return usernameValue;
}
function _base64urlDecode(str) {
    var buf = Buffer.from(str, 'base64'); 
    return buf;
}

module.exports = {
    getUserId
};