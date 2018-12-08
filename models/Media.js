'use strict';

const mongoose = require('mongoose');
const Event = require('./Event');
const User = require('./User');

const v = require('validator');
const validation = require('../startup/validation');
const constants = require('../constants/types');


var Schema = mongoose.Schema;

const mediaSchema = mongoose.Schema({
    name: { type: String, index: true },
    description: { type: String, index: true },
    url: { type: String, index: true, required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    media_type: { type: String, required: true, enum: Object.values(constants.MediaTypes), index: true },
    poster: { type: Boolean, index: true, default: false }
});

//Object.assign(mediaSchema.statics, { constants.MediaTypes });

/**
 * list of media types allowed
 */
mediaSchema.statics.allowedTypes = function () {
    return ['picture', 'video'];
};

mediaSchema.statics.createRecord = function (req, cb) {

    // Validations
    const valErrors = [];

    const { error } = validation.validateMedia(req.body);
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

    if (req.body.media_type === constants.MediaTypes.video) {  //only media picture can set poster to true
        req.body.poster = false;
    }

    //new Media
    const media = new Media({
        name: req.body.name,
        description: req.body.description || '',
        url: req.body.url,
        media_type: constants.MediaTypes[req.body.media_type],
        event: req.body.event,
        user: req.decoded.user._id,
        poster: req.body.poster
    })

    //we have to unset the media picture with poster to true , only one media picture with poster to true
    if (req.body.poster && req.body.media_type === constants.MediaTypes.picture) {
        Media.findOneAndUpdate({ event: req.body.event, poster: true, media_type: constants.MediaTypes.picture }, { $set: { poster: false } }, function (err, doc) {
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

    //Validation with joi
    const valErrors = [];

    if (((typeof req.body.token != 'undefined') && Object.keys(req.body).length == 1) || Object.keys(req.body).length < 1) {
        valErrors.push({ field: 'none', message: 'nothing_to_update' });
    }

    const { error } = validation.validateUpdatedMedia(req.body);
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

            updatedMedia.name = (typeof req.body.name !== 'undefined') ? req.body.name : updatedMedia.name;
            updatedMedia.description = (typeof req.body.description !== 'undefined') ? req.body.description : updatedMedia.description;
            updatedMedia.url = (typeof req.body.url !== 'undefined') ? req.body.url : updatedMedia.url;
            updatedMedia.media_type = (typeof req.body.media_type !== 'undefined') ? req.body.media_type : updatedMedia.media_type;
            if (req.body.media_type === constants.MediaTypes.picture) {
                updatedMedia.poster = req.body.poster;
            } else {
                updatedMedia.poster = false;
            }
            if ((typeof req.body.poster !== 'undefined') && req.body.media_type === constans.MediaTypes.picture && req.body.poster === 'true') {
                Media.findOneAndUpdate({ event: updatedMedia.event, poster: true, media_type: constants.MediaTypes.picture }, { $set: { poster: false } }, function (err, doc) {
                    if (err) {
                        return cb({ code: 500, ok: false, message: 'error_updating_previous_picture_poster' });
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
            DeletedMedia.remove(cb(null, DeletedMedia));
        }
    })

}

var Media = mongoose.model('Media', mediaSchema);

module.exports = Media;