const Joi = require('joi');

//constants
const constants = require('../constants/types');

module.exports = function () {
    Joi.objectId = require('joi-objectid')(Joi);
}

// *************
// *** USERS ***
// *************

function validateUser(user) {
    const schema = {
        first_name: Joi
            .string()
            .min(2)
            .max(50)
            .required(),
        last_name: Joi
            .string()
            .min(2)
            .max(255)
            .allow(''),
        email: Joi
            .string()
            .min(6)
            .max(255)
            .required()
            .email({ minDomainAtoms: 2 }),
        password: Joi
            .string()
            .regex(/^[a-zA-Z0-9]{6,50}$/)
            .required(),
        profile: Joi
            .string()
            .valid(Object.keys(constants.ProfileTypes))
            .allow(''),
        address: Joi
            .string()
            .max(255)
            .allow(''),
        city: Joi
            .objectId(),
        zip_code: Joi
            .string()
            .max(20)
            .allow(''),
        province: Joi
            .string()
            .max(255)
            .allow(''),
        country: Joi
            .string()
            .max(255)
            .allow(''),
        birthday_date: Joi
            .date()
            .allow(''),
        gender: Joi
            .string()
            .allow('')
            .valid(Object.keys(constants.GenderTypes)),
        alias: Joi
            .string()
            .alphanum()
            .max(255)
            .allow(''),
        idn: Joi
            .string()
            .alphanum()
            .allow('')
            .max(50),
        company_name: Joi
            .string()
            .allow('')
            .max(255),
        mobile_number: Joi
            .string()
            .allow('')
            .regex(/^[0-9]{11}$/),
        phone_number: Joi
            .string()
            .allow('')
            .regex(/^[0-9]{11}$/),
        validatedEmail: Joi
            .boolean().truthy('true').falsy('false').insensitive(true),
        tokenFB: Joi
            .string()
            .max(255)
            .allow(''),
    };
    return Joi.validate(user, schema, { abortEarly: false });
}

function validateUpdatedUser(user) {
    const schema = {
        first_name: Joi
            .string()
            .min(2)
            .max(50),
        last_name: Joi
            .string()
            .min(2)
            .max(255)
            .allow(''),
        email: Joi
            .string()
            .min(6)
            .max(255)
            .email({ minDomainAtoms: 2 }),
        password: Joi
            .string()
            .regex(/^[a-zA-Z0-9]{6,50}$/),
        profile: Joi
            .string()
            .valid(Object.keys(constants.ProfileTypes)),
        address: Joi
            .string()
            .max(255)
            .allow(''),
        city: Joi
            .objectId(),
        zip_code: Joi
            .string()
            .max(20)
            .allow(''),
        province: Joi
            .string()
            .max(255)
            .allow(''),
        country: Joi
            .string()
            .allow('')
            .max(255),
        birthday_date: Joi
            .date(),
        gender: Joi
            .string()
            .allow('')
            .valid(Object.keys(constants.GenderTypes)),
        alias: Joi
            .string()
            .alphanum()
            .allow('')
            .max(255),
        idn: Joi
            .string()
            .alphanum()
            .allow('')
            .max(50),
        company_name: Joi
            .string()
            .allow('')
            .max(255),
        mobile_number: Joi
            .string()
            .regex(/^[0-9]{11}$/)
            .allow(''),
        phone_number: Joi
            .string()
            .regex(/^[0-9]{11}$/)
            .allow(''),
        token: Joi
            .string(),
        validatedEmail: Joi
            .boolean().truthy('true').falsy('false').insensitive(true),
        tokenFB: Joi
            .string()
            .max(255)
            .allow(''),
    };
    return Joi.validate(user, schema, { abortEarly: false });
}

// *************
// *** MEDIA ***
// *************


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
            .valid(Object.keys(constants.MediaTypes))
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
            .max(150),
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
            .valid(Object.keys(constants.MediaTypes))
            .required(),
        poster: Joi
            .boolean(),
        token: Joi
            .string()
    };
    return Joi.validate(media, schema, { abortEarly: false });
}

// ********************
// *** TRANSACTIONS ***
// ********************


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

module.exports.validateUser = validateUser;
module.exports.validateUpdatedUser = validateUpdatedUser;
module.exports.validateMedia = validateMedia;
module.exports.validateUpdatedMedia = validateUpdatedMedia;
module.exports.validateTransaction = validateTransaction;

