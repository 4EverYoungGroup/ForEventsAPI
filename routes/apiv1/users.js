'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User');

const jwt = require('jsonwebtoken');
const config = require('../../local_config');
const hash = require('hash.js');

const jwtAuth = require('../../lib/jwtAuth');

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


module.exports = router;
