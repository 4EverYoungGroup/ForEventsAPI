'use strict';

const mongoose = require('mongoose');
const hash = require('hash.js');  //import to calculate hash of password
//const v = require('validator'); //import to validate data 
const pv = require('password-validator'); //control password restrictions
const Joi = require('joi'); //validate data provided API

const Favorite_search = require('./Favorite_search');
const City = require('./City');
const Transaction = require('./Transaction');
const Event = require('./Event')

var Schema = mongoose.Schema;

const passwordSchema = new pv();
passwordSchema
    .is().min(6)
    .is().max(50)
    .has().uppercase()
    .has().lowercase()
    .has().digits();

const GenderTypes = Object.freeze({
    M: 'Male',
    F: 'Female',
    O: 'Other'
});

const ProfileTypes = Object.freeze({
    Admin: 'Admin',
    User: 'User',
    Organizer: 'Organizer'
});

const userSchema = mongoose.Schema({
    first_name: { type: String, index: true, required: true },
    last_name: { type: String, index: true },
    email: { type: String, index: true, required: true },
    password: { type: String, required: true },
    profile: { type: String, enum: Object.values(ProfileTypes), default: 'User' },
    alias: String,
    birthday_date: Date,
    gender: { type: String, enum: Object.keys(GenderTypes) },
    address: String,
    zip_code: Number,
    province: String,
    country: String,
    idn: String,
    company_name: String,
    mobile_number: String,
    phone_number: String,
    create_date: { type: Date },
    delete_date: Date,
    favorite_searches: [{ type: Schema.Types.ObjectId, ref: 'Favorite_search' }],
    city: { type: Schema.Types.ObjectId, ref: 'City' },
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    // location: {
    //     type: { type: String },
    //     coordinates: [Number]
    // }
});

userSchema.index({ "location": "2dsphere" });

userSchema.statics.exists = function (idUser, cb) {
    User.findById(idUser, function (err, user) {
        if (err) return cb(err);
        return cb(null, user ? true : false);
    });
};

userSchema.statics.createRecord = function (newUser, cb) {

    //Validation with joi
    const valErrors = [];

    const { error } = validateUser(newUser);
    if (error) {
        error.details.map(function (err) {
            valErrors.push({ field: err.context.key, message: err.message });
        });
        //return cb({ ok: false, errors: valErrors });
    }
    //control restrictions password, must include 1 letter uppercase, 1 letter lowercase and 1 digit 
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
            //Initilize creation date
            newUser.create_date = Date.now();
            newUser.delete_date = null;
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
    if (req.body.first_name && !(v.isAlpha(req.body.first_name) && v.isLength(req.body.first_name, 2))) {
        valErrors.push({ field: 'first_name', message: 'validation_invalid_first_name' });
    }

    //format email is valid
    if (req.body.email && !v.isEmail(req.body.email)) {
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
            updatedUser.first_name = req.body.first_name;
            updatedUser.last_name = req.body.last_name;

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

    if (req.params.user_id != req.decoded.user._id) {
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

// We create a static method to search for users
// The search can be paged and ordered
userSchema.statics.getList = function (filters, limit, skip, sort, fields, transaction, favorite_searches, city, events, includeTotal, cb) {
    const query = User.find(filters);
    query.limit(limit);
    query.skip(skip);
    query.sort(sort);
    query.select(fields);


    if (favorite_searches) {
        query.populate('favorite_searches', favorite_searches);
    };
    if (transaction) {
        query.populate('transactions', transaction);
    };
    if (events) {
        query.populate('events', events);
    };
    if (city) {
        query.populate('city', city);
    }

    return query.exec(function (err, rows) {
        if (err) return cb(err);

        const result = { rows: rows };

        if (!includeTotal) return cb(null, result);

        // incluir propiedad total
        User.countDocuments({}, (err, total) => {
            if (err) return cb(err);
            result.total = total;
            return cb(null, result);
        });
    });


    //return query.exec();
}


//User profile

userSchema.statics.userProfileS = function (userId, profile) {
    if (userId.length === 24) {
        var exists = User.count({ _id: userId, profile: profile });
        return exists.exec()
    } else {
        throw new Error('The id must contain 24 characters or not exists!');
    }
};

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
            .max(255),
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
            .valid(Object.keys(ProfileTypes)),
        address: Joi
            .string()
            .max(255),
        city: Joi
            .objectId(),
        zip_code: Joi
            .string()
            .regex(/^[0-9]{5}$/),
        province: Joi
            .string()
            .alphanum()
            .max(255),
        country: Joi
            .string()
            .alphanum()
            .max(255),
        birthday_date: Joi
            .date(),
        gender: Joi
            .string()
            .valid(Object.keys(GenderTypes)),
        alias: Joi
            .string()
            .alphanum()
            .max(255),
        idn: Joi
            .string()
            .alphanum()
            .max(50),
        company_name: Joi
            .string()
            .max(255),
        mobile_number: Joi
            .string()
            .regex(/^[0-9]{9}$/),
        phone_number: Joi
            .string()
            .regex(/^[0-9]{9}$/)
    };
    return Joi.validate(user, schema, { abortEarly: false });
}
var User = mongoose.model('User', userSchema);



