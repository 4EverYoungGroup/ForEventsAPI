'use strict';

const mongoose = require('mongoose');
const Event = require('./Event');
const Favorite_search = require('./Favorite_search');
const async = require('async');

var Schema = mongoose.Schema;


//first, we created the scheme
const event_typeSchema = Schema({
    _id: Schema.Types.ObjectId,
    name: { type: String, index: true },
    events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    favorite_searches: [{ type: Schema.Types.ObjectId, ref: 'Favorite_search' }]
});


//Insert New Event_type
event_typeSchema.statics.insertEvent_type = function (event_type) {
    event_type._id = new mongoose.Types.ObjectId();
    try {
        event_type.save()
        return event_type;
    } catch (err) {

        return (err);
    }

    /*event_type.save((err, event_typeSaved) => {
    if (err){
        next(err);
        return (err);
    } else {
        try{
            return event_typeSaved;
        } catch (err){
            console.log(err);
        }       
    } 
});*/

    //return event_type;
}

//Update list of events (Add) when insert a new Event_type
event_typeSchema.statics.insertEvent = function (event_typeId, eventId) {
    Event_type.findOneAndUpdate({ _id: event_typeId },
        { $push: { events: eventId } },
        function (error, success) {
            if (error) {
                console.log('KO' + error);
            } else {
                //console.log('OK ' + success);
            }
        });
}

//Update list of favorite_searches (Add) when insert a new Event_type
event_typeSchema.statics.insertFavorite_Search = function (event_typeId, favorite_searchesId) {
    Event_type.findOneAndUpdate({ _id: event_typeId },
        { $push: { favorite_searches: favorite_searchesId } },
        function (error, success) {
            if (error) {
                console.log('KO' + error);
            } else {
                //console.log('OK ' + success);
            }
        });
}

//List of Event_type all or filter to _id
event_typeSchema.statics.list = function (event_typeID) {
    if (event_typeID == undefined) {
        const query = Event_type.find({});
        return query.exec();
    } else {
        const query = Event_type.find({ _id: event_typeID });
        return query.exec();
    };
}


//Create model
const Event_type = mongoose.model('Event_type', event_typeSchema);

//and export model
module.exports = Event_type;