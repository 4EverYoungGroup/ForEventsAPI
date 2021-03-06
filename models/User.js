'use strict';

const mongoose = require('mongoose');
const hash = require('hash.js');  //import to calculate hash of password

//validations
const pv = require('password-validator'); //control password restrictions
const Joi = require('joi'); //validate data provided API
const validation = require('../startup/validation');

//Collections
const Favorite_search = require('./Favorite_search');
const City = require('./City');
const Transaction = require('./Transaction');
const Event = require('./Event')

//constants
const constants = require('../constants/types');

const passwordSchema = new pv();
passwordSchema
    .is().min(6)
    .is().max(50)
    .has().uppercase()
    .has().lowercase()
    .has().digits();


// Schema definition
var Schema = mongoose.Schema;
const userSchema = mongoose.Schema({
    first_name: { type: String, index: true },
    last_name: { type: String, index: true },
    email: { type: String, index: true },
    password: { type: String },
    profile: { type: String, enum: Object.values(constants.ProfileTypes), default: 'User' },
    alias: { type: String, index: true },
    birthday_date: Date,
    gender: { type: String, enum: Object.keys(constants.GenderTypes) },
    address: { type: String, index: true },
    zip_code: { type: String, index: true },
    province: { type: String, index: true },
    country: { type: String, index: true },
    idn: { type: String, index: true },
    company_name: { type: String, index: true },
    mobile_number: { type: String, index: true },
    phone_number: { type: String, index: true },
    create_date: { type: Date },
    delete_date: Date,
    favorite_searches: [{ type: Schema.Types.ObjectId, ref: 'Favorite_search' }],
    city: { type: Schema.Types.ObjectId, ref: 'City' },
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    validatedEmail: { type: Boolean, default: false },
    tokensFB: [{ type: String }]
});



userSchema.statics.exists = function (idUser, cb) {
    User.findById(idUser, function (err, user) {
        if (err) return cb(err);
        return cb(null, user ? true : false);
    });
};

userSchema.statics.createRecord = function (newUser, cb) {

    //Validation with joi
    const valErrors = [];
    const { error } = validation.validateUser(newUser);
    if (error) {
        error.details.map(function (err) {
            valErrors.push({ field: err.context.key, message: err.message });
        });
    }
    //control restrictions password, must include 1 letter uppercase, 1 letter lowercase and 1 digit 
    if ((typeof newUser.password != 'undefined') && !passwordSchema.validate(newUser.password)) {

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
            //Initilize creation date
            newUser.create_date = Date.now();
            newUser.delete_date = null;
            // Create user
            new User(newUser).save(cb);

            //return cb(null, newUser);
        }
    });

};

userSchema.statics.deleteRecord = function (req, cb) {

    if (req.params.user_id != req.decoded.user._id && req.decoded.user.profile != 'Admin') {
        return cb({ code: 403, ok: false, message: 'action_not_allowed_to_credentials_provided' })

    }


    User.findOne({ _id: req.params.user_id }, function (err, DeletedUser) {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!DeletedUser) {
            return cb({ code: 404, ok: false, message: 'user_not_exist' })
        }
        else {
            DeletedUser.remove(cb);
        }
    })

}

userSchema.statics.updateRecord = function (req, cb) {
    //console.log('req.params._id: ' + req.params.user_id + ' req.decoded._id: ' + req.decoded.user._id);

    if (req.params.user_id != req.decoded.user._id && req.decoded.user.profile != 'Admin') {
        return cb({ code: 403, ok: false, message: 'action_not_allowed_to_credentials_provided' })

    }

    //Validation with joi
    const valErrors = [];

    //console.log(Object.keys(req.body).length)
    if (((typeof req.body.token != 'undefined') && Object.keys(req.body).length == 1) || Object.keys(req.body).length < 1) {
        valErrors.push({ field: 'none', message: 'nothing_to_update' });
    }

    const { error } = validation.validateUpdatedUser(req.body);
    if (error) {
        error.details.map(function (err) {
            valErrors.push({ field: err.context.key, message: err.message });
        });
    }

    //control restrictions password, must include 1 letter uppercase, 1 letter lowercase and 1 digit 
    if ((typeof req.body.password != 'undefined') && !passwordSchema.validate(req.body.password)) {
        valErrors.push({ field: 'password', message: 'password_not_valid_must_include_uppercase_lowercase_digits' });
    }

    if (valErrors.length > 0) {
        return cb({ code: 400, ok: false, message: valErrors });
    }


    // Find user
    User.findOne({ _id: req.params.user_id }, function (err, updatedUser) {

        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!updatedUser) {
            return cb({ code: 404, ok: false, message: 'user_not_exist' });
        }
        else {
            updatedUser.email = (typeof req.body.email !== 'undefined') ? req.body.email : updatedUser.email;
            updatedUser.first_name = (typeof req.body.first_name !== 'undefined') ? req.body.first_name : updatedUser.first_name;
            updatedUser.last_name = (typeof req.body.last_name !== 'undefined') ? req.body.last_name : updatedUser.last_name;
            // Calculate hash of paswword to save in database
            if ((typeof req.body.password !== 'undefined')) {
                let hashedPassword = hash.sha256().update(req.body.password).digest('hex');
                updatedUser.password = hashedPassword;
            }
            updatedUser.alias = (typeof req.body.alias !== 'undefined') ? req.body.alias : updatedUser.alias;
            updatedUser.birthday_date = (typeof req.body.birthday_date !== 'undefined') ? req.body.birthday_date : updatedUser.birthday_date;
            updatedUser.gender = (typeof req.body.gender !== 'undefined') ? req.body.gender : updatedUser.gender;
            updatedUser.address = (typeof req.body.address !== 'undefined') ? req.body.address : updatedUser.address;
            updatedUser.city = (typeof req.body.city !== 'undefined') ? req.body.city : updatedUser.city;
            updatedUser.zip_code = (typeof req.body.zip_code !== 'undefined') ? req.body.zip_code : updatedUser.zip_code;
            updatedUser.province = (typeof req.body.province !== 'undefined') ? req.body.province : updatedUser.province;
            updatedUser.country = (typeof req.body.country !== 'undefined') ? req.body.country : updatedUser.country;
            updatedUser.idn = (typeof req.body.idn !== 'undefined') ? req.body.idn : updatedUser.idn;
            updatedUser.company_name = (typeof req.body.company_name !== 'undefined') ? req.body.company_name : updatedUser.company_name;
            updatedUser.mobile_number = (typeof req.body.mobile_number !== 'undefined') ? req.body.mobile_number : updatedUser.mobile_number;
            updatedUser.phone_number = (typeof req.body.phone_number !== 'undefined') ? req.body.phone_number : updatedUser.phone_number;
            updatedUser.validatedEmail = (typeof req.body.validatedEmail !== 'undefined' && req.body.validatedEmail === 'true') ? req.body.validatedEmail : updatedUser.validatedEmail;

            if ((typeof req.body.tokenFB !== 'undefined') && (updatedUser.tokensFB.indexOf(req.body.tokenFB) === -1)) {
                updatedUser.tokensFB.push(req.body.tokenFB)
            }

            //update user
            updatedUser.save();
            return cb(null, updatedUser);
        }
    });
};

userSchema.statics.getRecord = function (req, cb) {

    if (req.params.user_id != req.decoded.user._id && req.decoded.user.profile != 'Admin') {
        return cb({ code: 403, message: 'action_not_allowed_credentials_error' })
    }


    User.findOne({ _id: req.params.user_id }, function (err, userDB) {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!userDB) {
            return cb({ code: 404, ok: false, message: 'user_not_exists' })
        }
        else {
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
    }).populate('city');

}

// We create a static method to search for users
// The search can be paged and ordered
userSchema.statics.getList = function (filters, limit, skip, sort, fields, includeTotal, cb) {


    //filters = {};
    const query = User.find(filters)
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
        User.countDocuments(filters, (err, total) => {
            if (err) return cb(err);
            result.total = total;
            return cb(null, result);
        });
    });
}

//Methods JOSEP

userSchema.statics.userProfileS = function (userId, profile) {
    if (userId.length === 24) {
        var exists = User.count({ _id: userId, profile: profile });
        return exists.exec()
    } else {
        throw new Error('The id must contain 24 characters or not exists!');
    }
};

userSchema.statics.insertFavorite_search = function (userId, favoriteId, cb) {
    User.findOneAndUpdate({ _id: userId }, { $push: { favorite_searches: favoriteId } }, function (error, success) {
        if (error) { return cb({ code: 400, ok: false, message: 'error_saving_data' }); }
        else { return cb(null, success); }
    });
};

userSchema.statics.deleteFavorite_search = function (userId, favoriteId, cb) {
    User.findOneAndUpdate({ _id: userId }, { $pull: { favorite_searches: favoriteId } }, { safe: true, upsert: true }, function (error, success) {
        if (error) { return cb({ code: 400, ok: false, message: 'error_deleting_data' }); }
        else { return cb(null, success); }
    });
};

// ******

var User = mongoose.model('User', userSchema);

module.exports = User;

