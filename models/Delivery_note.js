'use strict';

const mongoose = require('mongoose');
const User = require('./User');

var Schema = mongoose.Schema;


//first, we created the scheme
const delivery_noteSchema = Schema({
    _id: Schema.Types.ObjectId,
    begin_date: {type: Date, index: true},
    text: {type: String, index: true},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    event: {type: Schema.Types.ObjectId, ref: 'Event'},
    multicast_id: {type: String},
    success: Number,
    failure: Number,
    canonical_ids: Number,
    results: [{type: String}]
});


//Create model
const Delivery_note = mongoose.model('Delivery_note', delivery_noteSchema);

//and export model
module.exports = Delivery_note;
