'use strict';

const express = require('express');
const router = express.Router();

//database
const mongoose = require('mongoose');
const Media = mongoose.model('Media');
const Event = mongoose.model('Event');


const Joi = require('joi'); //validate data provided API

//security
const jwt = require('jsonwebtoken');
const jwtAuth = require('../../lib/jwtAuth');

//Auth with JWT
router.use(jwtAuth());


/**********************/
/****** GET LIST ******/
/**********************/

router.get('/list/:event_id', async (req, res, next) => {

    //validation format
    var valErrors = [];

    if (!mongoose.Types.ObjectId.isValid(req.params.event_id))
        return res.status(400).json({ ok: false, errors: 'event_format_is_not_correct' });

    //validation existance of event 
    const event = await Event.findById(req.params.event_id);
    if (!event) valErrors.push({ ok: false, message: 'event_not_exists' });

    if (valErrors.length > 0) {
        return res.status(400).json({ ok: false, errors: valErrors });
    }

    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100; // our api retunn  max 1000 registers
    const sort = req.query.sort || '-border';
    const includeTotal = req.query.includeTotal === 'true';
    const poster = req.query.poster;
    const fields = req.query.fields || 'name description url media_type poster';
    const filters = { event: req.params.event_id }

    if (poster) {
        filters.poster = poster;
    }

    Media.getList(filters, limit, skip, sort, fields, includeTotal, function (err, result) {
        if (err) return res.json(err);
        return res.json({ ok: true, result: result });
    });

});

/******************/
/****** GET  ******/
/*********** ******/

router.get('/:media_id', function (req, res, next) {

    Media.getRecord(req, function (err, result) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //media recovered
        return res.status(200).json({ ok: true, message: 'media_info', media: result });
    });
});


/******************/
/****** POST ******/
/******************/

router.post('/', async (req, res, next) => {

    if (req.decoded.user.profile != 'Admin' && req.decoded.user.profile != 'Organizer') {
        return res.status(403).json({ ok: false, message: 'action_not_allowed_to_credentials_provided' })
    }

    //validation format
    var valErrors = [];

    if (!mongoose.Types.ObjectId.isValid(req.body.event))
        return res.status(400).json({ ok: false, errors: 'event_format_is_not_correct' });

    //validation existance of event and user
    const event = await Event.findById(req.body.event);
    if (!event) valErrors.push({ ok: false, message: 'event_not_exists' });

    if (valErrors.length > 0) {
        return res.status(400).json({ ok: false, errors: valErrors });
    }

    Media.createRecord(req, function (err, result) {

        if (err) return res.status(400).json(err);

        // media created
        //insert new media in event collection
        Event.insertMedia(req.body.event, result._id, function (errInsert, resultInsert) {
            if (errInsert) {
                return res.status(errInsert.code).json({ ok: errInsert.ok, message: errInsert.message });
            }
        });

        return res.status(200).json({ ok: true, message: 'media_registered', data: result });
    });
});

// Return the list of available media types
router.get('/mediatypes', function (req, res) {
    res.json({ ok: true, allowedTypes: Media.allowedTypes() });
});


/*******************/
/****** PUT ******/
/*******************/

router.put('/:media_id', function (req, res, next) {

    if (req.decoded.user.profile != 'Admin' && req.decoded.user.profile != 'Organizer') {
        return res.status(403).json({ ok: false, message: 'action_not_allowed_to_credentials_provided' })
    }

    Media.updateRecord(req, function (err, result) {
        if (err) {
            return res.json(err);

        }
        //media updated
        return res.status(200).json({ ok: true, message: 'media_updated', user: result });
    });
});


/********************/
/****** DELETE ******/
/********************/


router.delete('/:media_id', function (req, res, next) {

    Media.deleteRecord(req, function (err, result) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //media deleted
        //delete media in event collection
        Event.deleteMedia(result.event, result._id, function (errDelete, resultDelete) {
            if (errDelete) {
                return res.status(errInsert.code).json({ ok: errDelete.ok, message: errDelete.message });
            }
        });

        return res.status(204).json({ ok: true, message: 'media_deleted' });
    });
});


module.exports = router;