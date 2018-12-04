const config = require('config');

module.exports = function () {

    //control environment variables, if not exist app not run
    if (!config.get('jwt.PrivateKey')) {
        throw new Error('FATAL ERROR: jwt.PrivateKey is not defined.');
    }
    if (!config.get('mail.user')) {
        throw new Error('FATAL ERROR: mail.user is not defined.');
    }
    if (!config.get('mail.pass')) {
        throw new Error('FATAL ERROR: mail.pass is not defined.');
    }
    if (!config.get('db.user')) {
        throw new Error('FATAL ERROR: db.user is not defined.');
    }
    if (!config.get('db.pass')) {
        throw new Error('FATAL ERROR: db.pass is not defined.');
    }
    // if (!config.get('fb.key')) {
    //     throw new Error('FATAL ERROR: fb.key is not defined.');
    // }
}