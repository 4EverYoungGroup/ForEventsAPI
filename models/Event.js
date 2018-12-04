'use strict';

const mongoose = require('mongoose');
const User = require('./User');
const Event_type = require('./Event_type');
const Transaction = require('./Transaction');
const Media = require('./Media')
var Schema = mongoose.Schema;


//first, we created the scheme
var eventSchema = Schema({
    _id: Schema.Types.ObjectId,
    begin_date: {type: Date, index: true},
    end_date: {type: Date, index: true},
    address: String,
    city: {type: String, index: true},
    zip_code: String,
    province: {type: String, index: true},
    country: {type: String, index: true},
    indoor: {type: Boolean, index: true},
    max_visitors: Number,
    free:  {type: Boolean, index: true},
    price: {type: Number, index: true},
    create_date: {type: Date, default: Date.now},
    min_age:{type: Number, index: true},
    name: {type: String, index: true},
    description: {type: String, index: true},
    deleted: {type: Date, index: true},
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    organizer: {type: Schema.Types.ObjectId, ref: 'User'},
    event_type: {type: Schema.Types.ObjectId, ref: 'Event_type'},
    transactions: [{type: Schema.Types.ObjectId, ref: 'Transaction'}],
    media: [{type: Schema.Types.ObjectId, ref: 'Media'}],
    active: Boolean,
    location: {
        type: { type: String},
        coordinates: [Number]
    }
});
eventSchema.index({ "location": "2dsphere" });

// We create a static method to search for events
// The search can be paged
eventSchema.statics.list = function(idUser,filters,limit, skip, sort, fields, organizer, media, users, event_type, transactions){
    const query = Event.find(filters);
    
    query.limit (limit);
    query.skip(skip);
    query.sort(sort);
    query.select(fields);
    if (organizer){
        query.populate('organizer', organizer);
    };
    if (media){
        query.populate('media', media);
    };

    if (idUser && users){
        query.populate({ path: 'users', select: users, match: { _id: idUser }});
    } else if(idUser){
        query.populate({ path: 'users', match: { _id: idUser }});
    } else if(users){
        query.populate('users', users);
    }
    
    if (event_type){
        query.populate('event_type', event_type);
    }
    if (idUser && transactions){
        query.populate({ path: 'transactions', select: transactions, match: { user: idUser }});
    }else if(idUser){
        query.populate({ path: 'transactions', match: { user: idUser }});
    }else if(transactions){
        query.populate('transactions', transactions);
    };
    return query.exec();
}

// We create a count of the total of events in the query
eventSchema.statics.countTot = function(filters){
    const queryC = Event.count(filters);
        return queryC.exec();
    }

eventSchema.statics.deleteEvent = function(eventId){
    Event.remove({_id: eventId }).exec();
};

//Exists an id event?
eventSchema.statics.existsId = function(eventId){
    if (eventId.length === 24){
        var exists = User.count({_id: eventId, deleted: null}) ;
        return exists.exec() 
   } else{
        throw new Error('The id must contain 24 characters!');
    }
}

//Insert New Event
eventSchema.statics.insertEvent = function(event,cb){
    event._id = new mongoose.Types.ObjectId();
   event.save((err, eventGuardado)=> {
    if (err){
        return cb({ code: 500, ok: false, message: 'error_saving_data'}); 
    } else {
        return cb(null,eventGuardado);
    } 
});
}
//Update list of Media (Add) when insert a new Media
eventSchema.statics.insertMedia = function(eventId,mediaId, cb){
    Event.findOneAndUpdate({_id: eventId}, 
            { $push: { media: mediaId } },
           function (error, success) {
                 if (error) {
                    return cb({ code: 400, ok: false, message: 'error_saving_data'}); 
                 } else {
                    return cb(null,success);
                 }
             });
}


// Insert a new User into Event Update list users
eventSchema.statics.insertUser = function(eventId,userId, cb){
    Event.findOneAndUpdate({_id: eventId}, 
            { $push: { users: userId} },
           function (error, success) {
                 if (error) {
                    return cb({ code: 400, ok: false, message: 'error_saving_data'}); 
                } else {
                    return cb(null,success);
                 }
             });
}
// Insert a new Transaction into Event Update list transactions
eventSchema.statics.insertTransaction = function(eventId, trasactionId, cb){
    Event.findOneAndUpdate({_id: eventId}, 
            { $push: { transactions: trasactionId} },
           function (error, success) {
                 if (error) {
                    return cb({ code: 400, ok: false, message: 'error_saving_data'}); 
                } else {
                    return cb(null,success);
                 }
             });
}


//Create model
const Event = mongoose.model('Event', eventSchema);

//and export model
module.exports = Event;
