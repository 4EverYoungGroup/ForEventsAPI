'use strict';

const express = require('express');
const router = express.Router();

//database
const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');
const Event = mongoose.model('Event');
const User = mongoose.model('User');


const Joi = require('joi'); //validate data provided API

//security
const jwt = require('jsonwebtoken');
const jwtAuth = require('../../lib/jwtAuth');

//Auth with JWT
router.use(jwtAuth());

router.get('/list', function (req, res, next) {

    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100; // our api retunn  max 1000 registers
    const sort = req.query.sort || '-create_date';
    const includeTotal = req.query.includeTotal === 'true';
    const user = req.query.user
    const fields = req.query.fields || 'user event create_date';
    var filters = {}

    if (typeof user != 'undefined') {
        if (req.decoded.user.profile === 'Admin') {
            filters = { user: user }   //user is an administrador and ask for any user
        }
        else {
            return res.status(403).json({ ok: false, message: 'action_not_allowed_to_credentials_provided' });
        }
    }
    else {
        filters = {
            user: req.decoded.user._id
        }
    }
    Transaction.getList(filters, limit, skip, sort, fields, includeTotal, function (err, result) {
        if (err) return res.json(err);
        return res.json({ ok: true, result: result });
    });

});


router.post('/', async (req, res, next) => {

    //validation format
    var valErrors = [];

    const { error } = validateTransaction(req.body);
    if (error) {
        error.details.map(function (err) {
            valErrors.push({ field: err.context.key, message: err.message });
        });
    }
    if (valErrors.length > 0) {
        return res.status(400).json({ ok: false, errors: valErrors });
    }

    //validation existance of event and user
    const event = await Event.findById(req.body.event);
    if (!event) valErrors.push({ field: 'event', message: 'event_not_exists' });

    //_id of user recovered from token
    const user = await User.findById(req.decoded.user._id);
    if (!user) valErrors.push({ field: 'user', message: 'user_not_exists' });

    if (valErrors.length > 0) {
        return res.status(400).json({ ok: false, errors: valErrors });
    }

    Transaction.createRecord(req, function (err, result) {
        if (err) return res.status(400).json(err);
        // transaction created
        Event.insertTransaction(req.body.event, result._id, function (errInsert, resultInsert) {
            if (errInsert) {
                return res.status(errInsert.code).json({ ok: errInsert.ok, message: errInsert.message });
            }
        });

        return res.status(200).json({ ok: true, message: 'transaction_registered', data: result });
    });
});


router.get('/:transaction_id', function (req, res, next) {
    Transaction.getRecord(req, function (err, result) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //transaction recovered
        return res.status(200).json({ ok: true, message: 'transaction_info', transaction: result });
    });
});


router.delete('/:transaction_id', function (req, res, next) {
    Transaction.deleteRecord(req, function (err) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //transaction deleted
        return res.status(204).json({ ok: true, message: 'transaction_deleted' });
    });
});

function validateTransaction(transaction) {
    const schema = {
        event: Joi
            .objectId()
            .required(),
        token: Joi
            .string()
    };
    return Joi.validate(transaction, schema, { abortEarly: false });
}

module.exports = router;