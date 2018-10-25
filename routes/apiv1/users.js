'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User');

const jwt = require('jsonwebtoken');
const config = require('../../local_config');
const hash = require('hash.js');

const nodemailer = require('nodemailer')

const jwtAuth = require('../../lib/jwtAuth');

const constants = require('../../commons/constants')

router.post('/login', function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    // Find user in db
    User.findOne({ email: email }, function (err, user) {
        if (err) return next(err);

        if (!user) {
            return res.json(400, {
                ok: false, error: {
                    message: 'user_not_found'
                }
            });
        } else if (user) {

            // hash pass provided and comparte with hash saved in db
            const passHash = hash.sha256().update(password).digest('hex');

            // compare passwords
            if (user.password != passHash) {
                //hashes not equal
                return res.json(400, {
                    ok: false, error: {
                        message: 'user_wrong_password'
                    }
                });
            } else {

                // user found and hash is equal
                // generate token
                const token = jwt.sign({ user: user }, config.jwt.secret, config.jwt.options);

                // return the information including token as JSON
                return res.json({ ok: true, token: token });
            }
        }
    });

});

router.post('/register', function (req, res, next) {
    User.createRecord(req.body, function (err) {

        if (err) return next(err);

        // user created
        return res.json(201, { ok: true, message: 'user_created', user: req.body });
    });
});

router.post('/recover', function (req, res, next) {

    User.findOne({ email: req.body.email }, function (err, userData) {
        if (err) {
            return res.status(500).json({ ok: false, code: 5000, message: 'error_accesing_data' });
        }
        if (!userData) {
            return res.status(404).json({ ok: false, code: 404, message: 'user_not_exist' });
        }
        else {
            const transporter = nodemailer.createTransport({
                host: constants.SMTP_HOST,
                port: constants.SMTP_PORT,
                secure: constants.SMTP_SECURE,
                auth: {
                    user: constants.SMTP_USER,
                    pass: constants.SMPT_PASS
                }
            })


            // setup e-mail data with unicode symbols
            const mailOptions = {
                from: '"4Events recover pass" <no-reply@4event.net>', // sender address
                to: req.body.email, // list of receivers
                subject: 'Recover pass 4Events', // Subject line
                text: 'Recover password click this link ...', // plaintext body
                html: '<b>Please click this <a href="">link</a> to recover password</b>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return res.status(400).json({ ok: false, message: error.message })
                }
                return res.status(400).json({ ok: true, message: 'recover-message-sent' })
            });
        }
    })
});

//Auth with JWT

router.use(jwtAuth());

router.delete('/:user_id', function (req, res, next) {
    User.deleteRecord(req, function (err) {
        if (err) {
            return res.json(err);
        }
        //user deleted
        return res.status(204).json({ ok: true, message: 'user_deleted' });
    });
});

router.put('/:user_id', function (req, res, next) {

    User.updateRecord(req, function (err) {
        if (err) {
            return res.json(err);
        }
        //user deleted
        return res.status(200).json({ ok: true, message: 'user_updated', user: req.body });
    });
});

router.get('/:user_id', function (req, res, next) {
    User.getRecord(req, function (err, result) {
        if (err) {
            return res.json(err);
        }
        //user deleted
        return res.status(200).json({ ok: true, message: 'user_info', user: result });
    });
});


module.exports = router;
