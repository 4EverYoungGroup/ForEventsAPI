'use strict';

const mongoose = require('mongoose');
const Event = require('./Event');
const Favorite_search = require('./Favorite_search');
const async = require('async');

var Schema = mongoose.Schema;


//first, we created the scheme
const event_typeSchema = Schema({
    _id: Schema.Types.ObjectId,
    name: {type: String, index: true},
    events: [{type: Schema.Types.ObjectId, ref: 'Event'}],
    favorite_searches: [{type: Schema.Types.ObjectId, ref: 'Favorite_search'}]
});


//Insert New Event_type with cb
event_typeSchema.statics.insertEvent_type =  function(event_type, cb){
    event_type._id = new mongoose.Types.ObjectId();
        event_type.save((err, event_typeSave) => {
            if (err){
                return cb({ code: 500, ok: false, message: 'error saving event_type'}); 
            } else {
                return cb(null,event_typeSave);
            } 
        });
}
//Static function to verify if the event_type exists
event_typeSchema.statics.event_typeExists= function(eventTypeId, cb){
    if (eventTypeId.length === 24){
        var exists = Event_type.count({_id: eventTypeId}) ;
        exists.exec ((err, existsNumber) =>{
            if (err || exists === 0){
                return cb(null,0)
            } else {
                return cb(null,existsNumber);
            }
        });
   } else{
        throw new Error('The id must contain 24 characters or not exists!');
    }
};

//Update list of events (Add) when insert a new Event
event_typeSchema.statics.insertEvent = function(event_typeId, eventId, cb){
    Event_type.findOneAndUpdate({_id: event_typeId}, 
            { $push: { events: eventId } },
           function (error, success) {
                 if (error) {
                    return cb({ code: 500, ok: false, message: 'error saving event_type'}); 
                } else {
                    return cb(null,success);
                 }
             });
}

//Update list of events (Delete) when delete a Event
event_typeSchema.statics.deleteEvent = function(event_typeId, eventId, cb){
    Event_type.findOneAndUpdate({_id: event_typeId}, 
            { $pull: { events: eventId } }, {safe: true, upsert: true},
           function (error, success) {
                 if (error) {
                    return cb({ code: 500, ok: false, message: 'error deleting event_type'}); 
                } else {
                    return cb(null,success);
                 }
             });
}

//Update list of favorite_searches (Add) when insert a new Favorite_Search
event_typeSchema.statics.insertFavorite_Search = function(event_typeId,favorite_searchesId,cb){
    Event_type.findOneAndUpdate({_id: event_typeId}, 
            { $push: { favorite_searches: favorite_searchesId } },
           function (error, success) {
                 if (error) {
                    return cb({ code: 500, ok: false, message: 'error saving Favorite_Search'}); 
                } else {
                    return cb(null,success);
                 }
             });
}

//Update list of favorite_searches (Delete) when delete a Favorite_Search
event_typeSchema.statics.deleteFavorite_Search = function(event_typeId,favorite_searchesId,cb){
    Event_type.findOneAndUpdate({_id: event_typeId}, 
            { $pull: { favorite_searches: favorite_searchesId } }, {safe: true, upsert: true},
           function (error, success) {
                 if (error) {
                    return cb({ code: 500, ok: false, message: 'error deleting Favorite_Search'}); 
                } else {
                    return cb(null,success);
                 }
             });
}

//List of Event_type all or filter to _id
event_typeSchema.statics.list = function(req, event_typeName){
    
    if (event_typeName){
        const query = Event_type.findOne({'name': event_typeName});
        return query.exec();
        };

    const idname = req.query.idname;
    const name = req.query.name;
    const id = req.query.id;
    const events = req.query.events;
    const favorite_searches= req.query.favorite_searches;
    const sort = req.query.sort;


    if(idname){
        const query = Event_type.findOne({'name': name});
        if(events){
            query.populate('events', events);
        };
       if (favorite_searches){
            query.populate('favorite_searches', favorite_searches);
       };
        return query.exec();
    } else if(name){

        const query = Event_type.find({'name': { $regex: new RegExp(name, "ig") }});
        
        if(events){
            query.populate('events', events);
        };
       if (favorite_searches){
            query.populate('favorite_searches', favorite_searches);
       };
        return query.exec();

    } else if (id == undefined){
        const query = Event_type.find({});
        if(sort){
            query.sort(sort);
        };
        if(events){
            query.populate('events', events);
        };
       if (favorite_searches){
            query.populate('favorite_searches', favorite_searches);
       };
    
        return query.exec();
    } else {
        const query = Event_type.findOne({_id: id});
        if(events){
            query.populate('events', events);
        };
       if (favorite_searches){
            query.populate('favorite_searches', favorite_searches);
       };
        return query.exec();
    };
}




//Create model
const Event_type = mongoose.model('Event_type', event_typeSchema);

//and export model
module.exports = Event_type;
