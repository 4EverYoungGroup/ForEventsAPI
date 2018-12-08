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


/**
 * @api {get} /medias/list/:event_id get
 * @apiversion 1.0.0
 * @apidescription This endpoint allow to recover the full list of medias of an event
 * 
 * Restrictions:
 * * Only authenticated users can do this action
 *
 * @apiName get
 * @apiGroup Media
 * @apiPermission authenticated_token_required: You must provide 'token' authorized in the querystring, body or header 'x-access-token'
 *
 * @apiParam (querystring) {String} event_id Id of Event, object Id of MongoDB database
 * @apiParam (body) {Number} [skip] Used to paginate result, number of pages you skip in the result obtained. By default 0
 * @apiParam (body) {Number} [limit] Number of result per page. By default 100
 * @apiParam (body) {String} [sort] Select the name of field to order, for example 'name'. If your use the sign - before the name of the field you sort in inverted order
 * @apiParam (body) {Boolean} [includeTotal] You can set to true if you want to obtain also the total number of registered recovered
 * @apiParam (body) {String} [fields] You can define the name of fields you want to recover from the databae. You must specify them separating them with spaces. Example 'name description url'
 * @apiParam (body) {Boolean} [border] You can set to true if you want to obtain only the media marked like 'poster'. Main picture of the event
 *  
 * @apiSuccess {Boolean} ok true
 * @apiSuccess {String} result array medias
 * @apiSuccess {Object} rows JSON Object with the media info of the event
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 Created
 *     {
 *   "ok": true,
 *   "result": {
 *       "rows": [
 *           {
 *               "poster": false,
 *               "_id": "5bfef85b799887eb34ea2f8a",
 *               "name": "foto11",
 *               "description": "",
 *               "url": "http://hello.com",
 *               "media_type": "picture"
 *           },
 *           {
 *               "poster": false,
 *               "_id": "5bfef86b799887eb34ea2f8b",
 *               "url": "https://firebasestorage.googleapis.com/v0/b/forevents-3a85b.appspot.com/o/images%2F1543828920528_Events_post_Insercion%20de%20Eventos.png?alt=media&token=24490ea9-8e94-414b-ae65-837cdea5fccb",
 *               "media_type": "picture",
 *               "name": "Cumpleaños",
 *               "description": "pues vaya"
 *           },
 *       ]
 *   }
 *}
 *
 * @apiError event_format_is_not_correct The event_id doesn't have a valid format Object Id MongoDB 
 * @apiError event_not_exists Event doesn't exist
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
 *       "message": "event_not_exists"
 *     }
 *  
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "ok": false
 *       "message": "event_format_is_not_correct"
 *     }
 * 
 */

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

/**
 *
 * @api {post} /medias/ post
 * @apiversion 1.0.0
 * @apidescription This endpoint allow user to register  medias (picture/video) to an event. Your id user is registed with the media
 * @apiName post
 * @apiGroup Media
 * @apiPermission authenticated_token_required: You must provide 'token' authorized in the querystring, body or header 'x-access-token'.
 * This action is only allow user with role of Organizer or Admin
 *
 * @apiParam (body) {String} name Name of the media (video or picture)
 * @apiParam (body) {String="picture","video"} media_type Media type values allowed 'video' or 'picture'
 * @apiParam (body) {String} [description] Description of the media (video or picture)
 * @apiParam (body) {String} url URL provided by Firebase system asociated to media (video or picture)
 * @apiParam (body) {String} event id of Event associated to the media file
 * @apiParam (body) {Boolean} [poster] You can specify like 'poster' to establish like main media for this event
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
 *                   "event": "5bd177e2f20d3103eb50d9c1",
 *                   "user": "5bedd86ca2b814bafbadf7c9",
 *                   "poster": false, 
 *                   "__v": 0
 *                   }
 *      }
 *
 * @apiError action_not_allowed_to_credentials_provided you must be an admin or organizer to register media to an event
 * @apiError event_id_must_be_provided must provide event_id valid
 * @apiError event_not_exists event_id not found in database
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