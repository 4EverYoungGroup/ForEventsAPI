'use strict';

const express = require('express');
const router = express.Router();

//database
const mongoose = require('mongoose');
const Province = mongoose.model('Province');

//security
const jwt = require('jsonwebtoken');
const jwtAuth = require('../../lib/jwtAuth');

//config
const config = require('config')


const constructSearchFilter = require('../../lib/utilitiesProvinces');

router.get('/list', function (req, res, next) {


    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100; // our api retunn  max 1000 registers
    const sort = req.query.sort || '_id';
    const includeTotal = req.query.includeTotal === 'true';
    const fields = req.query.fields || 'name';
    const filters = constructSearchFilter(req);

    Province.getList(filters, limit, skip, sort, fields, includeTotal, function (err, result) {
        if (err) return res.json(err);
        return res.json({ ok: true, result: result });
    });

});

//Auth with JWT - ***************

router.use(jwtAuth());

router.post('/', function (req, res, next) {


    if (req.decoded.user.profile != 'Admin') {
        return res.status(403).json({ ok: false, message: 'action_only_allowed_to_admin_users' })
    }


    Province.createRecord(req.body, function (err, result) {

        if (err) return res.status(400).json(err);

        // Province created
        return res.status(201).json({ ok: true, message: 'province_created', province: result });
    });
});


module.exports = router;
