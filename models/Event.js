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
  begin_date: { type: Date, index: true },
  end_date: { type: Date, index: true },
  adress: String,
  city: { type: String, index: true },
  zip_code: String,
  province: { type: String, index: true },
  country: { type: String, index: true },
  indoor: { type: Boolean, index: true },
  max_visitors: Number,
  free: { type: Boolean, index: true },
  price: { type: Number, index: true },
  create_date: { type: Date, default: Date.now },
  min_age: { type: Number, index: true },
  name: { type: String, index: true },
  description: String,
  deleted: { type: Date, index: true },
  user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  organizer: { type: Schema.Types.ObjectId, ref: 'User' },
  event_type: { type: Schema.Types.ObjectId, ref: 'Event_type' },
  transaction: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
  media: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
  location: {
    type: { type: String },
    coordinates: [Number]
  }
});

eventSchema.index({ "location": "2dsphere" });


//Update list of Media (Add) when insert a new Media
eventSchema.statics.insertMedia = function (eventId, mediaId) {
  Event.findOneAndUpdate({ _id: eventId },
    { $push: { media: mediaId } },
    function (error, success) {
      if (error) {
        console.log('KO' + error);
      } else {
        return success;
      }
    });
}


//Insert New Event
eventSchema.statics.insertEvent = function (event, cb) {
  event._id = new mongoose.Types.ObjectId();
  event.save((err, eventGuardado) => {
    if (err) {
      return cb({ code: 500, ok: false, message: 'error_saving_data' });
    } else {
      return cb(null, eventGuardado);
    }
  });

}


//Exists an id event?
eventSchema.statics.existsId = function (eventId) {
  if (eventId.length === 24) {
    var exists = User.count({ _id: eventId, deleted: null });
    return exists.exec()
  } else {
    throw new Error('The id must contain 24 characters!');
  }
}

// We create a static method to search for events
// The search can be paged
eventSchema.statics.list = function (filters, limit, skip, sort, fields, organizer, media, user, event_type, transaction) {
  //We build the query
  const query = Event.find(filters);
  query.limit(limit);
  query.skip(skip);
  query.sort(sort);
  query.select(fields);
  if (organizer) {
    query.populate('organizer', organizer);
  };
  if (media) {
    query.populate('media', media);
  };
  if (user) {
    query.populate('user', user);
  };
  if (event_type) {
    query.populate('event_type', event_type);
  }
  if (transaction) {
    query.populate('transaction', transaction);
  };

  // We execute the query and return a promise
  return query.exec();
}

// We create a count of the total of events in the query
eventSchema.statics.countTot = function (filters) {

  const queryC = Event.count(filters);

  return queryC.exec();
}

eventSchema.statics.deleteEvent = function (eventId) {
  console.log('event id: ' + eventId)
  Event.remove({ _id: eventId }).exec();

};

//Create model
const Event = mongoose.model('Event', eventSchema);

//and export model
module.exports = Event;