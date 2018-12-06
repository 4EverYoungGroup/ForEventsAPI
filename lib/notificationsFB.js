const GCM = require('node-gcm');
const config = require('config');

var message = new GCM.Message();

function sendNotification(message, tokens_fb, cb) {

    var sender = new GCM.Sender(config.fb.key);

    var message = new GCM.Message(message);

    sender.send(message, { registrationTokens: tokens_fb }, function (err, response) {
        if (err) cb({ ok: false, message: err });
        if (response) cb(null, { ok: true, message: response });
    });
}

module.exports.sendNotification = sendNotification;

