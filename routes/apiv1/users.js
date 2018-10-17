'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User');

const jwt = require('jsonwebtoken');
const config = require('../../local_config');
const hash = require('hash.js');

router.post('/authenticate', function (req, res, next) {

    const email = req.body.email;
    const password = req.body.password;

    // Find user in db
    User.findOne({ email: email }, function (err, user) {
        if (err) return next(err);

        if (!user) {
            return res.json({
                ok: false, error: {
                    code: 401,
                    message: res.__('users_user_not_found')
                }
            });
        } else if (user) {

            // hash pass provided and comparte with hash saved in db
            const passHash = hash.sha256().update(password).digest('hex');

            // compare passwords
            if (user.password != passHash) {
                //hashes not equal
                return res.json({
                    ok: false, error: {
                        code: 401,
                        message: res.__('users_wrong_password')
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
        return res.json({ ok: true, message: res.__('users_user_created') });
    });
});

module.exports = router;
