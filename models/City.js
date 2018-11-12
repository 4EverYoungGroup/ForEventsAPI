'use strict';

const mongoose = require('mongoose');
const User = require('./User');
const async = require('async');

var Schema = mongoose.Schema;

//first, we created the scheme
const citySchema = Schema({
    _id: Schema.Types.ObjectId,
    city: {type: String, index: true},
    province: {type: String, index: true},
    country: {type: String, index: true},
    location: {
        type: { type: String},
        coordinates: [Number]
    },
    users: [{type: Schema.Types.ObjectId, ref: 'User'}]
});
citySchema.index({ "location": "2dsphere" });


//List Cities containt partial word in a city, province or country
citySchema.statics.listCity = function(search){
    let regex = new RegExp(search,'i');
    const query = City.find({
        $or: [
           {'city': regex},
           {'province': regex},
           {'country': regex}
        ]
     })
    return query.exec();
}

//Search Cities for proximity
//long = longitude, lat = latitude, discance_m = distance in meters
citySchema.statics.nearMe = function(long, lat, distance_m){
    const distance =  City.find({ location: { $nearSphere: {
         $geometry: {type: 'Point', coordinates: [long, lat]},
     $maxDistance: distance_m }
     }});
 
     return distance.exec();
 }

//Insert New City
citySchema.statics.insertCity = function(city){
    city._id = new mongoose.Types.ObjectId();
    city.save((err, citySaved)=> {
    if (err){
        next(err);
        return (err);
    } else {
        try{
            return citySaved;
        } catch (err){
            console.log(err);
        }       
    } 
});
 return city;
}

//Update list of users (Add) when insert a new User
citySchema.statics.insertUser = function(cityId,userId){
    City.findOneAndUpdate({_id: cityId}, 
            { $push: { users: userId } },
           function (error, success) {
                 if (error) {
                     console.log('KO' + error);
                 } else {
                    //console.log('OK ' + success);
                 }
             });
}



//Create model
const City = mongoose.model('City', citySchema);

//and export model
module.exports = City;
