'use strict';

const mongoose = require('mongoose');
const User = require('./User');
const Event = require('./Event');

var Schema = mongoose.Schema;


//first, we created the scheme
const favorite_searchSchema = Schema({
    _id: Schema.Types.ObjectId,
    create_date: {type: Date, default: Date.now, index: true},
    query: {type: String, index: true},
    name_search: {type: String, index: true},
    event_type: [{type: Schema.Types.ObjectId, ref: 'Event_type'}],
    user: {type: Schema.Types.ObjectId, ref: 'User'}
});


//Insert New Favorite_Srearch
favorite_searchSchema.statics.insertFavorite_search =  function(userId,favorite_search,name_search, cb){
    if (!userId || !favorite_search || !name_search){
        return cb({ code: 400, ok: false, message: 'error saving Favorite_search User Id, name are required' + err});  

    }else{
        var favoriteS= new Favorite_search({
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            query: favorite_search,
            name_search: name_search
        });

        favoriteS.save((err, favoriteSearchSave) => {
                if (err){
                    return cb({ code: 500, ok: false, message: 'error saving Favorite_search ' + err}); 
                } else {
                        return cb(null,favoriteSearchSave);
                } 
            });
    }    
}

favorite_searchSchema.statics.list = function(filter,limit, skip, sort, fields){
    const query = Favorite_search.find(filter);
    query.limit (limit);
    query.skip(skip);
    query.sort(sort);
    query.select(fields);

    return query.exec();
};

favorite_searchSchema.statics.countTot = function(filters){
    const queryC = Favorite_search.count(filters);
        return queryC.exec();
    }


favorite_searchSchema.statics.deleteFavorite_Search = function(_id){
    Favorite_search.remove({_id: _id }).exec();
}


//Create model
const Favorite_search = mongoose.model('Favorite_search', favorite_searchSchema);

//and export model
module.exports = Favorite_search;
