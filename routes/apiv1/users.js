'use strict';

const express = require('express');
const router = express.Router();

//database
const mongoose = require('mongoose');
const User = mongoose.model('User');

//security
const jwt = require('jsonwebtoken');
const jwtAuth = require('../../lib/jwtAuth');
//const config = require('../../local_config');
const hash = require('hash.js');

const config = require('config')

//mailer
const nodemailer = require('nodemailer')

// commons
//const constants = require('../../commons/constants')

/**
 *
 * @api {post} /users/login login
 * @apiversion 1.0.0
 * @apidescription This endpoint allow user to authenticate in the system, the user must introduce email and password associated
 * @apiName login
 * @apiGroup User
 * @apiPermission none
 *
 * @apiParam {String} email Email of the user (unique ID)
 * @apiParam {String} password Password of the user
 *
 * @apiSuccess {Boolean} ok true
 * @apiSuccess {String} token  Token associated to user
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *           "ok": true,
 *           "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjViZDE3N2UyZjIwZDMxMDNlYjUwZDljMiIsImVtYWlsIjoiYWZlcm5hbmRlemdyQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiODZhNTNkZDMzYWEyMTEyYWEwMWEwM2VkNDg4YTc5NGNmYmJmZTkyNjA3Njc4ODI3ZTI1YjdiMWY1MmRhZDhhMiIsImZpcnN0TmFtZSI6IlBlcGUiLCJsYXN0TmFtZSI6IlBlcmV6IiwiX192IjowfSwiaWF0IjoxNTQwNTQzODg2LCJleHAiOjE1NDA3MTY2ODZ9.PCOKKjIULDZJxzGZBmYUe-kiLJcW4FzIvAByNYnSpuU"
 *     }
 *
 * @apiError user_not_found The email of the User was not found
 * @apiError user_wrong_password The password is incorrect for user provided
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "ok": false
 *       "message": "user_not_found"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "ok": false
 *       "message": "user_wrong_password"
 *     }
 */

router.post('/login', function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    // Find user in db
    User.findOne({ email: email }, function (err, user) {
        if (err) return next(err);

        if (!user) {
            return res.status(400).json({
                ok: false, message: 'user_not_found'
            });
        } else if (user) {

            // hash pass provided and comparte with hash saved in db
            const passHash = hash.sha256().update(password).digest('hex');

            // compare passwords
            if (user.password != passHash) {
                //hashes not equal
                return res.status(400).json({
                    ok: false, message: 'user_wrong_password'
                });
            } else {
                // user found and hash is equal
                // generate token
                const token = jwt.sign({ user: user }, config.get('jwt.PrivateKey'), config.get('jwt.Options'));

                // return the information including token as JSON
                return res.json({ ok: true, token: token });
            }
        }
    });

});


/**
 * @api {post} /users/register register
 * @apiversion 1.0.0
 * @apidescription 
 * This endpoint allow user to register. The user must provide first name, last name, email, password 
 * - It's not allowed to register two users with the same email
 * - Email format must be valid
 * - Passord must follow this rules: 6-50 length characters, must include one digit, one letter lower case and one letter upper case 
 * 
 * @apiName register
 * @apiGroup User
 * @apiPermission none
 *
 * 
 * @apiParam {String} firstName First name of the user
 * @apiParam {String} lastName Last name of the user 
 * @apiParam {String} email Email of the user (unique ID)
 * @apiParam {String} password Password of the user
 *
 * @apiSuccess {Boolean} ok true
 * @apiSuccess {String} message  user_created
 * @apiSuccess {Object} user JSON Object with the data of the user recentfly created
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *        "ok": true,
 *        "message": "user_created",
 *        "user": {
 *           "email": "test@gmail.com",
 *           "password": "b17e1e0450dac425ea318253f6f852972d69731d6c7499c001468b695b6da219",
 *           "firstName": "Pepe",
 *           "lastName": "García"
 *     }
 *
 *
 * @apiError user_email_duplicated The email of the user is duplicated in database
 * @apiError user_wrong_password The password is incorrect for user provided
 * @apiError validation_invalid_firstName The lenght of firstName must be min 2 character
 * @apiError validation_invalid_email The format of the email provided must be correct
 * @apiError password_not_valid_must_include_uppercase_lowercase_digits The password must follow the rules of complexity established
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "ok": false
 *       "message": "user_email_duplicated"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "ok": false,
 *       "errors": [
 *       {
 *           "field": "firstName",
 *           "message": "validation_invalid_firstName"
 *       },
 *       {
 *           "field": "email",
 *           "message": "validation_invalid_email"
 *       },
 *       {
 *           "field": "password",
 *           "message": "password_not_valid_must_include_uppercase_lowercase_digits"
 *       }]
 *     }
 */

router.post('/register', function (req, res, next) {
    User.createRecord(req.body, function (err, result) {

        if (err) return res.status(400).json(err);

        // user created
        return res.status(201).json({ ok: true, message: 'user_created', user: result });
    });
});

/**
 *
 * @api {post} /users/recover recover
 * @apiversion 1.0.0
 * @apidescription This endpoint allows user to recover the password to access the system. An email will be sent to user with a link to establish the new password
 * @apiName recover
 * @apiGroup User
 * @apiPermission none
 *
 * @apiParam {String} email Email of the user (unique ID)
 *
 * @apiSuccess {Boolean} ok true
 * @apiSuccess {String} message recover-message-sent
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "ok": true,
 *   "message": "recover-message-sent"
 * }
 *
 * @apiError error_accesing_data Error accesing database
 * @apiError email_not_registered Email not registered in database
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Server error
 *     {
 *       "ok": false
 *       "message": "error_accesing_data"
 *     }
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "ok": false
 *       "message": "email_not_registered"
 *     }
 */

router.post('/recover', function (req, res, next) {

    User.findOne({ email: req.body.email }, function (err, userData) {
        if (err) {
            return res.status(400).json({ ok: false, message: 'error_accesing_data' });
        }
        if (!userData) {
            return res.status(404).json({ ok: false, message: 'email_not_registered' });
        }
        else {
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
                return res.status(200).json({ ok: true, message: 'recover-message-sent' })
            });
        }
    })
});

//Auth with JWT

router.use(jwtAuth());

/**
 *
 * @api {delete} /users/:user_id delete
 * @apiversion 1.0.0
 * @apidescription This endpoint allows user to delete his user from the system. 
 *
 *  Restrictions:
 * * Only authenticated user can do this action
 * * Only the owner of the account or the administrator can delete an user
 * * When you delete a user all the events and searches saved will be deleted.
 * * The transacctions of user will not be deleted for statistics use
 * 
 * @apiName delete
 * @apiGroup User
 * @apiPermission authenticated_token_required: You must provide 'token' authorized in the querystring, body or header 'x-access-token'
 *
 * @apiParam {String} user_id Id of User, object Id of MongoDB database
 *
 * @apiSuccess {Boolean} ok true
 * @apiSuccess {String} message user_deleted
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *           "ok": true,
 *           "message": "user_deleted"
 *     }
 *
 * @apiError user_not_found The email of the User was not found
 * @apiError user_wrong_password The password is incorrect for user provided
 * @apiError action_not_allowed_credentials_error Action not allowed with token provided
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Server Error
 *     {
 *       "ok": false
 *       "message": "error_accesing_data"
 *     }
 * 
 *     HTTP/1.1 404 Not found
 *     {
 *       "ok": false
 *       "message": "email_not_exist"
 *     }
 * 
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "ok": false
 *       "message": "action_not_allowed_credentials_error"
 *     }
 */


router.delete('/:user_id', function (req, res, next) {
    User.deleteRecord(req, function (err) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //user deleted
        return res.status(204).json({ ok: true, message: 'user_deleted' });
    });
});

/**
 * @api {put} /users/user_id update
 * @apiversion 1.0.0
 * @apidescription 
 * This endpoint allow user update the data of the user. 
 * * It's only allowed to update data to owner of the account or an administrator
 * 
 * @apiName update
 * @apiGroup User
 * @apiPermission authenticated_token_required: You must provide 'token' authorized in the querystring, body or header 'x-access-token'
 *
 * 
 * @apiParam {String} firstName First name of the user
 * @apiParam {String} lastName Last name of the user 
 * @apiParam {String} email Email of the user (unique ID)
 * @apiParam {String} password Password of the user
 *
 * @apiSuccess {Boolean} ok true
 * @apiSuccess {String} message  user_created
 * @apiSuccess {Object} user JSON Object with the data of the user recently updated
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 Created
 *     {
 *        "ok": true,
 *        "message": "user_info",
 *        "user": {
 *           "email": "test@gmail.com",
 *           "password": "",
 *           "firstName": "Pepe",
 *           "lastName": "García"
 *        }
 *      }
 *
 * @apiError user_email_duplicated The email of the user is duplicated in database
 * @apiError user_wrong_password The password is incorrect for user provided
 * @apiError validation_invalid_firstName The lenght of firstName must be min 2 character
 * @apiError validation_invalid_email The format of the email provided must be correct
 * @apiError password_not_valid_must_include_uppercase_lowercase_digits The password must follow the rules of complexity established
 *
 * @apiErrorExample Error-Response:
 *
 *     HTTP/1.1 500 Server Error
 *     {
 *       "ok": false
 *       "message": "error_accesing_data"
 *     }
 * 
 *     HTTP/1.1 404 Not found
 *     {
 *       "ok": false
 *       "message": "email_not_exist"
 *     }
 * 
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "ok": false,
 *       "errors": [
 *       {
 *           "field": "firstName",
 *           "message": "validation_invalid_firstName"
 *       },
 *       {
 *           "field": "email",
 *           "message": "validation_invalid_email"
 *       },
 *       {
 *           "field": "password",
 *           "message": "password_not_valid_must_include_uppercase_lowercase_digits"
 *       }]
 *     }
 */

router.put('/:user_id', function (req, res, next) {

    User.updateRecord(req, function (err, result) {
        if (err) {
            return res.json(err);
        }
        //user deleted
        return res.status(200).json({ ok: true, message: 'user_updated', user: result });
    });
});

/**
 * @api {get} /users/:user_id get
 * @apiversion 1.0.0
 * @apidescription This endpoint allow to recover the profile information of an user
 * 
 * Restrictions:
 * * Only authenticated users can do this action
 * * Any user authenticated can do this action if he's not the owner of the account the info provided is restricted
 *
 * @apiName get
 * @apiGroup User
 * @apiPermission authenticated_token_required: You must provide 'token' authorized in the querystring, body or header 'x-access-token'
 *
 * @apiParam {String} user_id Id of User, object Id of MongoDB database
 *
 * @apiSuccess {Boolean} ok true
 * @apiSuccess {String} message  user_info
 * @apiSuccess {Object} user JSON Object with the data of the user consulted
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *        "ok": true,
 *        "message": "user_info",
 *        "user": {
 *           "email": "test@gmail.com",
 *           "password": "b17e1e0450dac425ea318253f6f852972d69731d6c7499c001468b695b6da219",
 *           "firstName": "Pepe",
 *           "lastName": "García"
 *        }
 *     }
 *
 * @apiError user_email_duplicated The email of the user is duplicated in database
 * @apiError user_wrong_password The password is incorrect for user provided
 * @apiError validation_invalid_firstName The lenght of firstName must be min 2 character
 * @apiError validation_invalid_email The format of the email provided must be correct
 * @apiError password_not_valid_must_include_uppercase_lowercase_digits The password must follow the rules of complexity established
 *
 * @apiErrorExample Error-Response:
 * 
 *     HTTP/1.1 500 Server Error
 *     {
 *       "ok": false
 *       "message": "error_accesing_data"
 *     }
 * 
 *     HTTP/1.1 404 Not found
 *     {
 *       "ok": false
 *       "message": "user_not_exist"
 *     }
 */



router.get('/:user_id', function (req, res, next) {
    User.getRecord(req, function (err, result) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //user deleted
        return res.status(200).json({ ok: true, message: 'user_info', user: result });
    });
});


module.exports = router;
