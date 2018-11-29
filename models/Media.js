'use strict';

const mongoose = require('mongoose');
const Event = require('./Event');
const User = require('./User');

const Joi = require('joi'); //validate data provided API
const v = require('validator');

const MediaTypes = Object.freeze({
    picture: 'picture',
    video: 'video'
});

var Schema = mongoose.Schema;

const mediaSchema = mongoose.Schema({
    name: { type: String, index: true, required: true },
    description: { type: String, index: true },
    url: { type: String, index: true, required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    media_type: { type: String, required: true, enum: Object.values(MediaTypes), index: true },
    poster: { type: Boolean, index: true, default: false }
});

Object.assign(mediaSchema.statics, { MediaTypes });

/**
 * list of media types allowed
 */
mediaSchema.statics.allowedTypes = function () {
    return ['picture', 'video'];
};

mediaSchema.statics.createRecord = function (req, cb) {

    // Validations
    const valErrors = [];

    const { error } = validateMedia(req.body);
    if (error) {
        error.details.map(function (err) {
            valErrors.push({ field: err.context.key, message: err.message });
        });

    }

    // verification url
    if (v.isEmpty(req.body.url) || !v.isURL(req.body.url)) {
        valErrors.push({ field: 'url', message: 'url_malformed' });
    }

    if (valErrors.length > 0) {
        return cb({ ok: false, errors: valErrors });
    }

    if (req.body.media_type === MediaTypes.video) {  //only media picture can set poster to true
        req.body.poster = false;
    }



    //create new media
    const media = new Media({
        name: req.body.name,
        description: req.body.description || '',
        url: req.body.url,
        media_type: MediaTypes[req.body.media_type],
        event: req.body.event,
        user: req.decoded.user._id,
        poster: req.body.poster
    })

    //we have to unset the media picture with poster to true , only one media picture with poster to true
    if (req.body.poster && req.body.media_type === MediaTypes.picture) {
        Media.findOneAndUpdate({ event: req.body.event, poster: true, media_type: MediaTypes.picture }, { $set: { poster: false } }, function (err, doc) {
            if (err) {
                return cb({ code: 500, ok: false, message: 'error_updating_previos_picture_poster' });
            }
        });
    }

    //if there is no medias registered for this event we force poster to true
    Media.countDocuments({ event: req.body.event }, (err, total) => {
        if (err) return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        if (total === 0) media.poster = true;
    });

    media.save((err, doc) => {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_saving_data' });
        }
        else {
            return cb(null, doc);
        }
    })
};

mediaSchema.statics.getRecord = function (req, cb) {

    //validation format
    var valErrors = [];

    if (!mongoose.Types.ObjectId.isValid(req.params.media_id))
        return res.status(400).json({ ok: false, errors: 'media_id_format_is_not_correct' });

    Media.findOne({ _id: req.params.media_id }, function (err, mediaDB) {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!mediaDB) {
            return cb({ code: 404, ok: false, message: 'media_not_exists' })
        }
        else {
            return cb(null, mediaDB)
        }
    })

}

// We create a static method to search for medias
// The search can be paged and ordered
mediaSchema.statics.getList = function (filters, limit, skip, sort, fields, includeTotal, cb) {

    const query = Media.find(filters);
    query.limit(limit);
    query.skip(skip);
    query.sort(sort);
    query.select(fields);



    return query.exec(function (err, rows) {
        if (err) return cb(err);

        const result = {
            rows: rows,
        };

        if (!includeTotal) return cb(null, result);

        // incluir propiedad total
        Media.count(filters, (err, total) => {
            if (err) return cb(err);
            result.total = total;
            return cb(null, result);
        });
    })
}

mediaSchema.statics.updateRecord = function (req, cb) {

    // if (req.params.user_id != req.decoded.user._id && req.decoded.user.profile != 'Admin') {
    //     return cb({ code: 403, ok: false, message: 'action_not_allowed_to_credentials_provided' })

    // }

    //Validation with joi
    const valErrors = [];

    //console.log(Object.keys(req.body).length)
    if (((typeof req.body.token != 'undefined') && Object.keys(req.body).length == 1) || Object.keys(req.body).length < 1) {
        valErrors.push({ field: 'none', message: 'nothing_to_update' });
    }

    const { error } = validateUpdatedMedia(req.body);
    if (error) {
        error.details.map(function (err) {
            valErrors.push({ field: err.context.key, message: err.message });
        });
    }


    if (valErrors.length > 0) {
        return cb({ code: 400, ok: false, message: valErrors });
    }


    // Find media
    Media.findOne({ _id: req.params.media_id }, function (err, updatedMedia) {

        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!updatedMedia) {
            return cb({ code: 404, ok: false, message: 'media_not_exist' });
        }
        else {

            if (updatedMedia.user != req.decoded.user._id && req.decoded.user.profile != 'Admin') {
                return cb({ code: 403, ok: false, message: 'action_not_allowed_to_credentials_provided' })
            }

            updatedMedia.name = req.body.name;
            updatedMedia.description = req.body.description;
            updatedMedia.url = req.body.url;
            updatedMedia.media_type = req.body.media_type;
            if (req.body.media_type === MediaTypes.picture) {
                updatedMedia.poster = req.body.poster;
            } else {
                updatedMedia.poster = false;
            }

            if (req.body.poster && req.body.media_type === MediaTypes.picture) {
                Media.findOneAndUpdate({ event: updatedMedia.event, poster: true, media_type: MediaTypes.picture }, { $set: { poster: false } }, function (err, doc) {
                    if (err) {
                        return cb({ code: 500, ok: false, message: 'error_updating_previos_picture_poster' });
                    }
                });
            }


            //update media
            updatedMedia.save();
            return cb(null, updatedMedia);
        }
    });
};

mediaSchema.statics.deleteRecord = function (req, cb) {

    Media.findOne({ _id: req.params.media_id }, function (err, DeletedMedia) {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!DeletedMedia) {
            return cb({ code: 404, ok: false, message: 'media_not_exist' })
        }
        else {
            if (DeletedMedia.user != req.decoded.user._id && req.decoded.user.profile != 'Admin') {
                return cb({ code: 403, ok: false, message: 'action_not_allowed_to_credentials_provided' })
            }

            if (DeletedMedia.poster) {
                return cb({ code: 400, ok: false, message: 'delete_not_allowed_mark_another_media_poster_true_previously' })
            }
            DeletedMedia.remove(cb);
        }
    })

}

function validateMedia(media) {
    const schema = {
        name: Joi
            .string()
            .min(5)
            .max(150)
            .required(),
        description: Joi
            .string()
            .max(255)
            .allow(''),
        url: Joi
            .string()
            .required()
            .uri(),
        media_type: Joi
            .string()
            .valid(Object.keys(MediaTypes))
            .required(),
        event: Joi
            .objectId()
            .required(),
        poster: Joi
            .boolean(),
        token: Joi
            .string()
    };
    return Joi.validate(media, schema, { abortEarly: false });
}

function validateUpdatedMedia(media) {
    const schema = {
        name: Joi
            .string()
            .min(5)
            .max(150)
            .required(),
        description: Joi
            .string()
            .max(255)
            .allow(''),
        url: Joi
            .string()
            .required()
            .uri(),
        media_type: Joi
            .string()
            .valid(Object.keys(MediaTypes))
            .required(),
        poster: Joi
            .boolean(),
        token: Joi
            .string()
    };
    return Joi.validate(media, schema, { abortEarly: false });
}

var Media = mongoose.model('Media', mediaSchema);

module.exports = Media;