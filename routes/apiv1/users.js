'use strict';

const express = require('express');
const router = express.Router();

//database
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Event = mongoose.model('Event');
const Favorite_search = mongoose.model('Favorite_search');



//security
const jwt = require('jsonwebtoken');
const jwtAuth = require('../../lib/jwtAuth');
const hash = require('hash.js');

//config
const config = require('config')

//mailer
const mailer = require('../../lib/mailer');

//FB notifications
const fbNotification = require('../../lib/notificationsFB.js')

//utilities
const constructSearchFilter = require('../../lib/utilitiesUsers');

//constants
const constants = require('../../constants/types');

/*******************/
/****** LOGIN ******/
/*******************/

router.post('/login', function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    // Find user in db
    User.findOne({ email: email }, function (err, user) {
        if (err) return next(err);

        if (!user) {
            return res.status(400).json({
                ok: false, message: 'user_or_pass_wrong'
            });
        } else if (user) {

            // hash pass provided and comparte with hash saved in db
            const passHash = hash.sha256().update(password).digest('hex');

            // compare passwords
            if (user.password != passHash) {
                //hashes not equal
                return res.status(400).json({
                    ok: false, message: 'user_or_password_wrong'
                });
            } else {
                // user found and hash is equal
                // generate token
                const token = jwt.sign({ user: user }, config.get('jwt.PrivateKey'), config.get('jwt.Options'));

                // return the information including token as JSON
                user.password = '**ENCRYPTED**'
                return res.json({ ok: true, token: token, user: user });
            }
        }
    }).populate('city');

});


/**********************/
/****** REGISTER ******/
/**********************/

router.post('/register', function (req, res, next) {
    User.createRecord(req.body, function (err, result) {
        if (err) return res.status(400).json(err);


        // user created
        if (result) {
            //TODO: specify id of the register pass
            var idRequest = 1234

            mailer.sendMail(req.body.email, idRequest, result, constants.TemplateTypes.register,
                function (error, data) {
                    if (error) return res.status(500).json({ ok: false, message: 'error_sending_email_register' })
                    return res.status(201).json({ ok: true, message: 'user_created_email_email_sent', user: result });
                });
        }

    });
});


/*********************/
/****** RECOVER ******/
/*********************/

router.post('/recover', function (req, res, next) {

    User.findOne({ email: req.body.email }, function (err, userData) {
        if (err) {
            return res.status(400).json({ ok: false, message: 'error_accesing_data' });
        }
        if (!userData) {
            return res.status(404).json({ ok: false, message: 'email_not_registered' });
        }
        else {
            //TODO: specify id of the recover pass
            var idRequest = 1234
            var data = {}
            mailer.sendMail(req.body.email, idRequest, data, constants.TemplateTypes.recover,
                function (error, data) {
                    if (error) return res.status(500).json({ ok: false, message: 'error_sending_email' })
                    else return res.status(200).json({ ok: data.ok, message: data.message })
                });
        }
    })
});


//Auth with JWT - ***************

router.use(jwtAuth());

//TODO: Eliminar esta funcionalidad, solamente de ejmplo para Josep

router.post('/notificate', function (req, res, next) {

    const event_id = '5bfef45a4dd10ae820fdeaa7'
    const currentDate = new Date();

    var message = {
        collapseKey: '4Events',
        priority: 'high',
        contentAvailable: true,
        delayWhileIdle: true,
        timeToLive: 3,
        data: {
            event_id: event_id,
        },
        notification: {
            title: "4Events: Nuevo evento registrado",
            icon: "ic_launcher",
            body: "Hemos encontrado un nuevo evento que puede ser de tu agrado. " + currentDate.getDate()
        }
    };

    //TODO: eliminar estas lineas
    //armando
    const token_fbArmando = 'eLM7ZeTEkwA:APA91bETqgO6VJLVGlOHm1g03oWOcQfYSzFxu5huYW46q8eoV4wH8NSZpCRNPLSJO-wkKrcL968Jpu2uoqw0EIPITtSzpHgwYBvwWtPfQnb6-YlGCQ5k4woyoVCvNddyXUMOWI_IIOFA';

    //luis
    const token_fbLuis = 'dRr4_uFzv4o:APA91bHNCPA0X83hlvBUAJTpG5zR3pl_K9uJ4Qa05u-LJyicTFaSiCvYfeJG4gTIhGlHf61Y8NM4JXH_YjXeXa3fBWU6I2GFTTcD_c0a7-hL65_QeUCydTLlLgYYdku5VXe5cm0XHoj7';

    const tokens_fb = [token_fbLuis, token_fbArmando];

    fbNotification.sendNotification(message, tokens_fb, function (error, data) {
        if (error) res.status(error.message).json({ ok: false, message: 'error_sending_notification' })
        if (data) res.status(200).json({ ok: true, message: data });
    })
});


/********************/
/****** DELETE ******/
/********************/



router.delete('/:user_id', function (req, res, next) {
    User.deleteRecord(req, function (err) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //user deleted

        //Delete events associated
        Event.deleteMany({ organizer: req.params.user_id }, function (errDeleteEvent, resulDeleteEvent) {
            if (errDeleteEvent) {
                return res.status(500).json({ ok: false, message: errDeleteEvent.message });
            }
            //Delete Favourite_searches
            Favorite_search.deleteMany({ user: req.params.user_id }, function (errDeleteFS, resulDeleteFS) {
                if (errDeleteFS) {
                    return res.status(500).json({ ok: false, message: errDeleteFS.message });
                }
                return res.status(204).json({ ok: true, message: 'user_deleted' });
            });
        });


    });
});


/*****************/
/****** PUT ******/
/*****************/


router.put('/:user_id', function (req, res, next) {

    User.updateRecord(req, function (err, result) {
        if (err) {
            //return res.statisjson(err);
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //user updated
        return res.status(200).json({ ok: true, message: 'user_updated', user: result });
    });
});


/***********************/
/****** GET LIST *******/
/***********************/


router.get('/list', function (req, res, next) {

    if (req.decoded.user.profile != 'Admin') {
        return res.status(403).json({ ok: false, message: 'action_only_allowed_to_admin_users' })
    }

    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100; // our api retunn  max 1000 registers
    const sort = req.query.sort || '_id';
    const includeTotal = req.query.includeTotal === 'true';
    const fields = req.query.fields || 'first_name last_name profile email';

    const filters = constructSearchFilter(req);

    User.getList(filters, limit, skip, sort, fields, includeTotal, function (err, result) {

        if (err) return res.json(err);
        return res.json({ ok: true, result: result });
    });

});


/*****************/
/****** GET ******/
/*****************/

router.get('/:user_id', function (req, res, next) {
    User.getRecord(req, function (err, result) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //user get
        return res.status(200).json({ ok: true, message: 'user_info', user: result });
    });
});


module.exports = router;
