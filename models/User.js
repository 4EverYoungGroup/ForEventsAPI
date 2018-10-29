'use strict';

const mongoose = require('mongoose');
const hash = require('hash.js');  //import to calculate hash of password
const v = require('validator'); //import to validate data 
const pv = require('password-validator'); //control password restrictions

const passwordSchema = new pv();
passwordSchema
    .is().min(6)
    .is().max(50)
    .has().uppercase()
    .has().lowercase()
    .has().digits();

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
    if (newUser.firstName && !(v.isAlpha(newUser.firstName) && v.isLength(newUser.firstName, 2))) {
        valErrors.push({ field: 'firstName', message: 'validation_invalid_firstName' });
    }

    //format email is valid
    if (!v.isEmail(newUser.email)) {
        valErrors.push({ field: 'email', message: 'validation_invalid_email' });
    }

    //control restrictions passwor, must include 1 letter uppercase, 1 letter lowercase and 1 digit 
    if (!passwordSchema.validate(newUser.password)) {
        valErrors.push({ field: 'password', message: 'password_not_valid_must_include_uppercase_lowercase_digits' });
    }

    if (valErrors.length > 0) {
        return cb({ ok: false, errors: valErrors });
    }


    // Verify duplicates
    // Find user
    User.findOne({ email: newUser.email }, function (err, user) {

        if (err) {
            return cb(err);
        }

        // user already exists
        if (user) {
            return cb({ ok: false, message: 'user_email_duplicated' });
        } else {

            // Calculate hash of paswword to save in database
            let hashedPassword = hash.sha256().update(newUser.password).digest('hex');
            newUser.password = hashedPassword;

            // Create user
            new User(newUser).save();
            return cb(null, newUser);
        }
    });

};

userSchema.statics.deleteRecord = function (req, cb) {
    console.log('req.params._id: ' + req.params.user_id + ' req.decoded._id: ' + req.decoded.user._id);
    console.log(req.decoded.user.email);
    if (req.params.user_id != req.decoded.user._id) {
        return cb({ code: 403, ok: false, message: 'action_not_allowed_credentials_error' })

    }
    //TODO: Validate admin user to allow acciont


    User.findOne({ email: req.decoded.user.email }, function (err, DeletedUser) {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!DeletedUser) {
            return cb({ code: 404, ok: false, message: 'email_not_exist' })
        }
        else {
            DeletedUser.remove(cb);
        }
    })

    //TODO: Delete events associated

    //TODO: Delete Favourite_searches
}

userSchema.statics.updateRecord = function (req, cb) {

    // Validations
    const valErrors = [];
    if (req.body.firstName && !(v.isAlpha(req.body.firstName) && v.isLength(req.body.firstName, 2))) {
        valErrors.push({ field: 'firstName', message: 'validation_invalid_firstName' });
    }

    //format email is valid
    if (!v.isEmail(req.body.email)) {
        valErrors.push({ field: 'email', message: 'validation_invalid_email' });
    }


    //control restrictions passwor, must include 1 letter uppercase, 1 letter lowercase and 1 digit 
    if (req.body.password && !passwordSchema.validate(req.body.password)) {
        valErrors.push({ field: 'password', message: 'password_not_valid_must_include_uppercase_lowercase_digits' });
    }

    if (valErrors.length > 0) {
        return cb({ code: 400, ok: false, errors: valErrors });
    }

    // Find user
    User.findOne({ email: req.decoded.user.email }, function (err, updatedUser) {

        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!updatedUser) {
            return cb({ code: 404, ok: false, message: 'user_not_exist' });
        }
        else {
            updatedUser.email = req.body.email;
            updatedUser.firstName = req.body.firstName;
            updatedUser.lastName = req.body.lastName;

            // Calculate hash of paswword to save in database
            if (req.body.password) {
                let hashedPassword = hash.sha256().update(req.body.password).digest('hex');
                updatedUser.password = hashedPassword;
            }

            //update user
            updatedUser.save();
            return cb(null, updatedUser);
        }
    });
};

userSchema.statics.getRecord = function (req, cb) {

    //if (req.params.user_id != req.decoded.user._id){
    //    return cb({ code: 403 , message: 'action_not_allowed_credentials_error'})      
    //}

    User.findOne({ _id: req.params.user_id }, function (err, userDB) {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!userDB) {
            return cb({ code: 404, ok: false, message: 'user_not_exists' })
        }
        else {
            //console.log('requ.params.user_id: ' + req.params.user_id + ' req.decoded.user._id: ' + req.decoded.user._id)
            if (req.params.user_id != req.decoded.user._id) {
                //restricted access to data of user , password is not available
                //TODO avoid initialization to '', delete of the propertie, delete not running well
                userDB.password = ''
                return cb(null, userDB)
            } else {
                //unrestricted access to data of user
                return cb(null, userDB)
            }
        }
    })

}
var User = mongoose.model('User', userSchema);
