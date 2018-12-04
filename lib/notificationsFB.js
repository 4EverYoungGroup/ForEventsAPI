const gcm = require('node-gcm');
const config = require('config');
const sender = new gcm.Sender(config.get('fb.key'));

function sendNotification(message, tokens_fb) {

    message = {
        title: 'Nuevo eventro registrado en Zamora',
        content: 'Hemos registrado un nuevo evento en 4Events que pensamos sea de tu agrado',
        event_id: '5bfef45a4dd10ae820fdeaa7'
    }

    //TODO: eliminar esta linea
    tokens_fb = ['eLM7ZeTEkwA:APA91bETqgO6VJLVGlOHm1g03oWOcQfYSzFxu5huYW46q8eoV4wH8NSZpCRNPLSJO-wkKrcL968Jpu2uoqw0EIPITtSzpHgwYBvwWtPfQnb6-YlGCQ5k4woyoVCvNddyXUMOWI_IIOFA'];


    var message = new gcm.Message({
        data: message
    });


    // Send the message
    sender.send(message, { registrationTokens: tokens_fb }, function (err, response) {
        if (err) console.error(err);
        else console.log(response);
    });

}

module.exports.sendNotification = sendNotification;