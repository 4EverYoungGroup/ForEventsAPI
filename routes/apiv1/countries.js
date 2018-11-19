'use strict';

const express = require('express');
const router = express.Router();

//database
const mongoose = require('mongoose');
const Country = mongoose.model('Country');

//security
const jwt = require('jsonwebtoken');
const jwtAuth = require('../../lib/jwtAuth');

//config
const config = require('config')


const constructSearchFilter = require('../../lib/utilitiesCountries');

router.get('/list', function (req, res, next) {


    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100; // our api retunn  max 1000 registers
    const sort = req.query.sort || '_id';
    const includeTotal = req.query.includeTotal === 'true';
    const fields = req.query.fields || 'name';
    const filters = constructSearchFilter(req);

    Country.getList(filters, limit, skip, sort, fields, includeTotal, function (err, result) {
        if (err) return res.json(err);
        return res.json({ ok: true, result: result });
    });

});

router.get('/:country_id', function (req, res, next) {
    Country.getRecord(req, function (err, result) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        return res.status(200).json({ ok: true, message: 'country_info', country: result });
    });
});

//Auth with JWT - ***************

router.use(jwtAuth());

router.post('/', function (req, res, next) {


    if (req.decoded.user.profile != 'Admin') {
        return res.status(403).json({ ok: false, message: 'action_only_allowed_to_admin_users' })
    }


    Country.createRecord(req.body, function (err, result) {

        if (err) return res.status(400).json(err);

        // Country created
        return res.status(201).json({ ok: true, message: 'country_created', country: result });
    });
});


module.exports = router;
