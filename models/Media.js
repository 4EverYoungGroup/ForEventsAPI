'use strict';

const mongoose = require('mongoose');
const Event = require('./Event');
const v = require('validator'); //import to validate data 

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
    media_type: { type: [String], required: true, enum: Object.values(MediaTypes), index: true }
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
    //min length of name
    if (newMedia.name && !v.isLength(newMedia.name, 2)) {
        valErrors.push({ field: 'name', message: 'validation_invalid_name_min_length_2_characters' });
    }

    // verification url
    if (typeof newMedia.url == 'undefined') {
        valErrors.push({ field: 'url', message: 'url_must_be_provided' });
    }
    else if (v.isEmpty(newMedia.url) || !v.isURL(newMedia.url)) {
        valErrors.push({ field: 'url', message: 'url_malformed' });
    }
    //console.log(newMedia.event_id)
    // verification event_id
    if (typeof newMedia.event_id == 'undefined') {
        valErrors.push({ field: 'event_id', message: 'event_id_must_be_provided' });
    } else if (Event.findOne({ _id: newMedia.event_id }), function (err, data) {
        if (err) valErrors.push({ field: 'event_id', message: 'error_accesing_database' });
        console.log('data:' + data)
        if (!data) valErrors.push({ field: 'event_id', message: 'error_event_id_not_found_in_database' });
    })

        //verificaciont media_type
        if (typeof newMedia.media_type == 'undefined') {
            valErrors.push({ field: 'media_type', message: 'media_type_not_defined' });
        } else if (typeof MediaTypes[newMedia.media_type] == 'undefined') {
            valErrors.push({ field: 'media_type', message: 'media_type_provide_not_valid' });
        }

    if (valErrors.length > 0) {
        return cb({ ok: false, errors: valErrors });
    }

    const media = new Media({
        name: newMedia.name,
        description: newMedia.description || '',
        url: newMedia.url,
        media_type: MediaTypes[newMedia.media_type],
        event_id: newMedia.event_id
    })

    media.save((err, doc) => {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_saving_data' });
        }
        else {
            return cb(null, doc);
        }
    })
};


var Media = mongoose.model('Media', mediaSchema);