'use strict';

//mailer
const nodemailer = require('nodemailer');
const emailTemplates = require('email-templates');

//config
const config = require('config')

//constants
const constants = require('../constants/types');


function sendMessage(email, emailType, cb) {

    const transporter = nodemailer.createTransport({
        host: config.get('mail.host'),
        port: config.get('mail.port'),
        secure: config.get('mail.secure'),
        auth: {
            user: config.get('mail.user'),
            pass: config.get('mail.pass')
        }
    })


    // setup e-mail data with unicode symbols
    const mailOptions = {
        from: '"no-reply 4events" <no-reply@4events.net>', // sender address
        to: email, // list of receivers
        //text: 'Recover password click this link ...', // plaintext body
        generateTextFromHTML: true,
        html: "<img src='cid:logo@4events.net'/><b>Please click this <a href=''>link</a> to recover password</b>", // html body
        attachments: [{
            filename: "logo4events.png",
            path: "./public/images/logo4events.png",
            cid: "logo@4events.net" //same cid value as in the html img src
        }]
    };

    switch (emailType) {
        case constants.EmailTypes.recover:
            mailOptions.subject = 'Recover pass 4events';
            break;
        case constants.EmailTypes.register:
            mailOptions.subject = 'Register new user';
            break;
        default:
            mailOptions.subject = '4events email';
    }

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        console.log(error);
        if (error) {
            return cb({ ok: false, message: error.message });
        }
        return cb(null, { ok: true, message: 'recover-message-sent' });
    });
}
module.exports.sendMessage = sendMessage;