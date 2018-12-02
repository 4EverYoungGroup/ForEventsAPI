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

function sendMail(emailRecipient, idRequest, templateType, cb) {
    const options = {
        //template: path.join(__dirname, '../', 'templates', 'resetPassword'),
        message: {
            to: emailRecipient
        },
        locals: {
            name: '',
            token: idRequest
        }
    }

    switch (templateType) {
        case constants.TemplateTypes.recover:
            options.template = path.join(__dirname, '../', 'templates', 'resetPassword');
            break;
        case constants.TemplateTypes.register:
            options.template = path.join(__dirname, '../', 'templates', 'registerUser');
            break;
        default:
            options.template = '4events email';
    }

    email.send(options, function (err, data) {
        if (err) {
            return cb({ ok: false, message: error.message });
        }
        if (data) return cb(null, { ok: true, message: 'recover-message-sent' });
    });
}
//         .then()
//         .catch(console.error);
// }
// function sendMail() {
//     //create the path of email template folder 
//     var templateDir = path.join(__dirname, '../', 'templates', 'resetPassword')

//     var testMailTemplate = new Email(templateDir)

//     var locals = {
//         userName: "XYZ" //dynamic data for bind into the template
//     };


//     testMailTemplate.render(locals, function (err, temp) {
//         if (err) {
//             console.log("error", err);
//         } else {
//             transporter.sendMail({
//                 from: 'no-reply@4events.net',
//                 to: 'afernandezgr@gmail.com',
//                 subject: "Reset password",
//                 text: temp.text,
//                 html: temp.html
//             }, function (error, info) {
//                 if (error) {
//                     console.log(error);
//                 }
//                 console.log('Message sent: ' + info.response);
//             })
//         }
//     })
// }

module.exports.sendMail = sendMail;