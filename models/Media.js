'use strict';

const mongoose = require('mongoose');
const Event = require('./Event');

const Joi = require('joi'); //validate data provided API

//const Event = mongoose.model('Event');

const MediaTypes = Object.freeze({
    picture: 'picture',
    video: 'video'
});


const mediaSchema = mongoose.Schema({
    name: { type: String, index: true },
    description: { type: String, index: true },
    url: { type: String, index: true },
    event_id: { type: mongoose.Schema.Types.ObjectId, required: true },
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

mediaSchema.statics.createRecord = function (newMedia, cb) {

    // Validations
    const valErrors = [];

    const { error } = validateMedia(newMedia);
    if (error) {
        error.details.map(function (err) {
            valErrors.push({ field: err.context.key, message: err.message });
        });

    }


    // verification url
    // if (typeof newMedia.url == 'undefined') {
    //     valErrors.push({ field: 'url', message: 'url_must_be_provided' });
    // }
    // else if (v.isEmpty(newMedia.url) || !v.isURL(newMedia.url)) {
    //     valErrors.push({ field: 'url', message: 'url_malformed' });
    // }
    //console.log(newMedia.event_id)
    // verification event_id
    // if (typeof newMedia.event_id == 'undefined') {
    //     valErrors.push({ field: 'event_id', message: 'event_id_must_be_provided' });
    // } else if (Event.findOne({ _id: newMedia.event_id }), function (err, data) {
    //     if (err) valErrors.push({ field: 'event_id', message: 'error_accesing_database' });
    //     //console.log('data:' + data)
    //     if (!data) valErrors.push({ field: 'event_id', message: 'error_event_id_not_found_in_database' });
    // })

    //verificaciont media_type
    // if (typeof newMedia.media_type == 'undefined') {
    //     valErrors.push({ field: 'media_type', message: 'media_type_not_defined' });
    // } else if (typeof MediaTypes[newMedia.media_type] == 'undefined') {
    //     valErrors.push({ field: 'media_type', message: 'media_type_provide_not_valid' });
    // }

    if (valErrors.length > 0) {
        return cb({ ok: false, errors: valErrors });
    }

    if (newMedia.media_type === MediaTypes.video) {  //only media picture can set poster to true
        newMedia.poster = false;
    }

    const media = new Media({
        name: newMedia.name,
        description: newMedia.description || '',
        url: newMedia.url,
        media_type: MediaTypes[newMedia.media_type],
        event_id: newMedia.event_id,
        poster: newMedia.poster
    })

    //we have to unset the media picture with poster to true , only one media picture with poster to true
    if (newMedia.poster) {
        Media.findOneAndUpdate({ event_id: newMedia.event_id, poster: true, media_type: MediaTypes.picture }, { $set: { poster: false } }, function (err, doc) {
            if (err) {
                return cb({ code: 500, ok: false, message: 'error_updating_previos_picture_poster' });
            }
        });
    }

    media.save((err, doc) => {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_saving_data' });
        }
        else {


            return cb(null, doc);
        }
    })
};


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
        event_id: Joi
            .objectId(),
        poster: Joi
            .boolean(),
        token: Joi
            .string()
    };
    return Joi.validate(media, schema, { abortEarly: false });
}

var Media = mongoose.model('Media', mediaSchema);

module.exports = Media;