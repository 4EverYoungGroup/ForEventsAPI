'use strict';

const express = require('express');
const router = express.Router();

//database
const mongoose = require('mongoose');
const Media = mongoose.model('Media');
const Event = mongoose.model('Event');

//security
const jwt = require('jsonwebtoken');
const jwtAuth = require('../../lib/jwtAuth');

//Auth with JWT
router.use(jwtAuth());

router.get('/list/:event_id', function (req, res, next) {

    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100; // our api retunn  max 1000 registers
    const sort = req.query.sort || '-border';
    const includeTotal = req.query.includeTotal === 'true';
    const poster = req.query.poster;
    const fields = req.query.fields || 'name description url media_type poster';
    const filters = { event_id: req.params.event_id }

    if (poster) {
        filters.poster = poster;
    }

    Media.getList(filters, limit, skip, sort, fields, includeTotal, function (err, result) {
        if (err) return res.json(err);
        return res.json({ ok: true, result: result });
    });

});

/**
 *
 * @api {post} /medias/ post
 * @apiversion 1.0.0
 * @apidescription This endpoint allow user to upload any media to the system
 * @apiName post
 * @apiGroup Media
 * @apiPermission authenticated_token_required: You must provide 'token' authorized in the querystring, body or header 'x-access-token'
 *
 * @apiParam {String} name Name of the media (video or picture)
 * @apiParam {String} media_type Media type value allowed 'video' or 'picture'
 * @apiParam {String} description Description of the media (video or picture)
 * @apiParam {String} url URL provided by Firebase system asociated to media (video or picture)
 * @apiParam {String} event_id _id of Event associated to the media file
 * 
 *
 * @apiSuccess {Boolean} ok true
 * @apiSuccess {String} message "media_registered"
 * @apiSuccess {Object} data { object media recently stored }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *           "ok": true,
 *           "message": "media_registered",
 *           "data": {
 *                   "media_type": [
 *                                  "video"
 *                                  ],
 *                   "_id": "5bd88b1df9e5bd4177da575b",
 *                   "name": "foto1",
 *                   "description": "kksksksks",
 *                   "url": "http://ex.com",
 *                   "event_id": "5bd177e2f20d3103eb50d9c1",
 *                   "__v": 0
 *                   }
 *      }
 *
 * @apiError validation_invalid_name_min_length_2_characters min length of 2 characters to name
 * @apiError url_must_be_provided must provide url
 * @apiError url_malformed format of the URL is not valid
 * @apiError event_id_must_be_provided must provide event_id valid
 * @apiError error_event_id_not_found_in_database event_id not found in database
 * @apiError media_type_not_defined media type not provided
 * @apiError media_type_provide_not_valid type of media is not valid (picture or video)  
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "ok": false
 *       "message": "media_not_registered"
 *     }    
 *
 * 
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "ok": false
 *       "message": "action_not_allowed_credentials_error"
 *     }
 */

router.post('/', function (req, res, next) {

    // if (mongoose.Types.ObjectId.isValid(req.body.event_id)) {
    //     Event.findById(req.body.event_id, function (err, data) {
    //         if (err) next(err); //{ ok: false, message: 'error_accesing_database' });
    //         //         // if not existe return error 404
    //         console.log(data)
    //         if (!data) next({ ok: false, message: 'event_not_exist' });
    //     });
    //     // }
    //     // else {
    //     //     return res.status(400).json({ ok: false, message: 'event_format_invalid' });
    // }

    // console.log('entro medias post')

    Media.createRecord(req.body, function (err, result) {

        if (err) return res.status(400).json(err);

        // media created
        //insert new media in event collection
        Event.insertMedia(req.body.event_id, result._id, function (errInsert, resultInsert) {
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

router.put('/:media_id', function (req, res, next) {

    Media.updateRecord(req, function (err, result) {
        if (err) {
            return res.json(err);

        }
        //media updated
        return res.status(200).json({ ok: true, message: 'media_updated', user: result });
    });
});


router.get('/:media_id', function (req, res, next) {
    Media.getRecord(req, function (err, result) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //media recovered
        return res.status(200).json({ ok: true, message: 'media_info', media: result });
    });
});


router.delete('/:media_id', function (req, res, next) {
    Media.deleteRecord(req, function (err) {
        if (err) {
            return res.status(err.code).json({ ok: err.ok, message: err.message });
        }
        //media deleted
        return res.status(204).json({ ok: true, message: 'media_deleted' });
    });
});

module.exports = router;