'use strict';

const mongoose = require('mongoose');
const Event = require('./Event');
const User = require('./User');

const Joi = require('joi'); //validate data provided API

var Schema = mongoose.Schema;


//first, we created the scheme
const transactionSchema = Schema({
    create_date: { type: Date, default: Date.now, index: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },

});



transactionSchema.statics.exists = function (idTransaction, cb) {
    Transaction.findById(idTransaction, function (err, transaction) {
        if (err) return cb(err);
        return cb(null, transaction ? true : false);
    });
};

transactionSchema.statics.createRecord = function (newTransaction, cb) {

    //Validation with joi
    const valErrors = [];

    const { error } = validateTransaction(newTransaction);
    if (error) {
        error.details.map(function (err) {
            valErrors.push({ field: err.context.key, message: err.message });
        });
    }

    if (valErrors.length > 0) {
        return cb({ ok: false, errors: valErrors });
    }

    Transaction.findOne({ event: newTransaction.event, user: newTransaction.user }, function (err, transaction) {
        if (err) {
            return cb(err);
        }
        // transaction already exists
        if (transaction) {
            return cb({ ok: false, message: 'user_already_registered_for_event' });
        }
        else {
            // User.findOne({ _id: newTransaction.user }, function (errUser, userDB) {
            //     if (errUser) return cb(errUser);
            //     if (!userDB) return cb({ ok: false, code: 404, message: 'user_not_exist' });
            //     return userDB
            // })

            //TODO: Verify user and event exist in database

            //Create Transaction
            new Transaction(newTransaction).save(cb);
        }
    });
};

transactionSchema.statics.deleteRecord = function (req, cb) {

    Transaction.findOne({ _id: req.params.transaction_id }, function (err, DeletedTransaction) {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!DeletedTransaction) {
            return cb({ code: 404, ok: false, message: 'transaction_not_exist' })
        }
        else {

            if (DeletedTransaction.user != req.decoded.user._id && req.decoded.user.profile != 'Admin') {
                return cb({ code: 403, ok: false, message: 'action_not_allowed_to_credentials_provided' })
            }

            DeletedTransaction.remove(cb);
        }
    })

}

transactionSchema.statics.getRecord = function (req, cb) {

    Transaction.findOne({ _id: req.params.transaction_id }, function (err, transactionDB) {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error_accesing_data' });
        }

        if (!transactionDB) {
            return cb({ code: 404, ok: false, message: 'transaction_not_exists' })
        }
        else {

            if (transactionDB.user != req.decoded.user._id && req.decoded.user.profile != 'Admin') {
                return cb({ code: 403, ok: false, message: 'action_not_allowed_to_credentials_provided' })
            }

            return cb(null, transactionDB)
        }
    })
}

// We create a static method to search for transactions
// The search can be paged and ordered
transactionSchema.statics.getList = function (filters, limit, skip, sort, fields, includeTotal, cb) {

    const query = Transaction.find(filters);
    query.limit(limit);
    query.skip(skip);
    query.sort(sort);
    query.select(fields);

    query.populate('event');
    query.populate('user');

    return query.exec(function (err, rows) {
        if (err) return cb(err);

        const result = {
            rows: rows,
        };

        if (!includeTotal) return cb(null, result);

        // incluir propiedad total
        Transaction.count(filters, (err, total) => {
            if (err) return cb(err);
            result.total = total;
            return cb(null, result);
        });
    })
}

// ** VALIDATION PARAMS

function validateTransaction(transaction) {
    const schema = {

        event: Joi
            .objectId()
            .required(),
        user: Joi
            .objectId()
            .required(),
        token: Joi
            .string()
    };
    return Joi.validate(transaction, schema, { abortEarly: false });
}

//Create model
var Transaction = mongoose.model('Transaction', transactionSchema);

//and export model
module.exports = Transaction;
