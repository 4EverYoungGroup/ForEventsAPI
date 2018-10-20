'use strict';

const mongoose = require('mongoose');
const hash = require('hash.js');  //import to calculate hash of password
const v = require('validator'); //import to validate data 

const userSchema = mongoose.Schema({
    firstName: { type: String, index: true },
    lastName: { type: String, index: true },
    email: { type: String, index: true },
    password: String,
    latitude: { type: Number },
    longitude: { type: Number }
});

userSchema.statics.exists = function (idUser, cb) {
    User.findById(idUser, function (err, user) {
        if (err) return cb(err);
        return cb(null, user ? true : false);
    });
};

userSchema.statics.createRecord = function (newUser, cb) {

    // Validations
    const valErrors = [];
    if (!(v.isAlpha(newUser.firstName) && v.isLength(newUser.firstName, 2))) {
        valErrors.push({ field: 'firstName', message: 'validation_invalid_firstName' });
    }

    if (!v.isEmail(newUser.email)) {
        valErrors.push({ field: 'email', message: 'validation_invalid_email' });
    }

    if (!v.isLength(newUser.password, 6)) {
        valErrors.push({ field: 'password', message: 'validation_minchars_6' });
    }


    if (valErrors.length > 0) {
        return cb({ code: 422, errors: valErrors });
    }


    // Verify duplicates
    // Find user
    User.findOne({ email: newUser.email }, function (err, user) {

        if (err) {
            return cb(err);
        }

        // user already exists
        if (user) {
            return cb({ code: 409, message: 'user_email_duplicated' });
        } else {

            // Calculate hash of paswword to save in database
            let hashedPassword = hash.sha256().update(newUser.password).digest('hex');

            newUser.password = hashedPassword;

            // Create user
            new User(newUser).save(cb);
        }
    });

};

var User = mongoose.model('User', userSchema);
