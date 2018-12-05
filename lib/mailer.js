'use strict';

const nodemailer = require("nodemailer");
const Email = require('email-templates');
const path = require('path');
//config
const config = require('config')

//constants
const constants = require('../constants/types');

const transporter = nodemailer.createTransport({
    host: config.get('mail.host'),
    port: config.get('mail.port'),
    secure: config.get('mail.secure'),
    auth: {
        user: config.get('mail.user'),
        pass: config.get('mail.pass')
    }
})


const email = new Email({
    message: {
        from: 'no-reply@4events.net',
        attachments: [{
            filename: "logo4events.png",
            path: "./public/images/logo4events.png",
            cid: "logo@4events.net" //same cid value as in the html img src
        }]
    },
    // uncomment below to send emails in development/test env:
    send: true,
    transport: transporter,
    views: {
        options: {
            extension: 'ejs'
        },
    }
});

function sendMail(emailRecipient, idRequest, data, templateType, cb) {
    const options = {
        //template: path.join(__dirname, '../', 'templates', 'resetPassword'),
        message: {
            to: emailRecipient
        },
    }

    switch (templateType) {
        case constants.TemplateTypes.recover:
            options.template = path.join(__dirname, '../', 'templates', 'resetPassword');
            options.locals = {
                name: '',
                token: idRequest
            }
            break;
        case constants.TemplateTypes.register:
            options.template = path.join(__dirname, '../', 'templates', 'registerUser');
            options.locals = {
                name: data.first_name,
                token: idRequest
            }
            break;
        default:
            options.template = '4events email';
    }

    email.send(options)
        .then(data => cb(null, { ok: true, message: "reset_password_email_sent" }))
        .catch(error => cb({ ok: false, message: "reset_password_email_failed" }))
}

module.exports.sendMail = sendMail;