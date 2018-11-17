'use strict';

const mongoose = require('mongoose');
const User = require('./User');
const Event_type = require('./Event_type');
var Schema = mongoose.Schema;


//first, we created the scheme
const favorite_searchSchema = Schema({
    _id: Schema.Types.ObjectId,
    create_date: { type: Date, default: Date.now, index: true },
    query: { type: String, index: true },
    event_type: [{ type: Schema.Types.ObjectId, ref: 'Event_type' }],
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});




//Create model
const Favorite_search = mongoose.model('Favoritesearch', favorite_searchSchema);

//and export model
module.exports = Favorite_search;