const gcm = require('node-gcm');
//const config = require('config');

//android
//const FBKEY = 'AAAAaXfomec:APA91bFX8EaL2A8BkDrmztRbkcg_PFAMQY1CtObe0BiywhA_nikfwmMLltCO1ipHaciF9TgMVMTdZoQkjZffRWC-9_8H-lskMkykPVQr8GrUJrqp1aowe7_MIW_dydODRh12TlXEhq6X'

//iOS
const FBKEY = 'AAAAaXfomec:APA91bFX8EaL2A8BkDrmztRbkcg_PFAMQY1CtObe0BiywhA_nikfwmMLltCO1ipHaciF9TgMVMTdZoQkjZffRWC-9_8H-lskMkykPVQr8GrUJrqp1aowe7_MIW_dydODRh12TlXEhq6X'

//const sender = new gcm.Sender(config.get('fb.key'));
const sender = new gcm.Sender(FBKEY);

function sendNotification(message, tokens_fb) {

    message = {
        title: 'Nuevo eventro registrado en Zamora',
        content: 'Hemos registrado un nuevo evento en 4Events que pensamos sea de tu agrado',
        event_id: '5bfef45a4dd10ae820fdeaa7'
    }

    //TODO: eliminar esta linea
    //armando
    tokens_fb = ['eLM7ZeTEkwA:APA91bETqgO6VJLVGlOHm1g03oWOcQfYSzFxu5huYW46q8eoV4wH8NSZpCRNPLSJO-wkKrcL968Jpu2uoqw0EIPITtSzpHgwYBvwWtPfQnb6-YlGCQ5k4woyoVCvNddyXUMOWI_IIOFA'];

    //luis
    tokens_fb = ['dRr4_uFzv4o:APA91bHNCPA0X83hlvBUAJTpG5zR3pl_K9uJ4Qa05u-LJyicTFaSiCvYfeJG4gTIhGlHf61Y8NM4JXH_YjXeXa3fBWU6I2GFTTcD_c0a7-hL65_QeUCydTLlLgYYdku5VXe5cm0XHoj7'];

    var message = new gcm.Message({
        data: message
    });
    console.log('FBKEY:' + FBKEY);
    console.log('token_device:' + tokens_fb);

    // Send the message
    sender.send(message, { registrationTokens: tokens_fb }, function (err, response) {
        if (err) console.error(err);
        else console.log(response);
    });

}

module.exports.sendNotification = sendNotification;

sendNotification({}, '');