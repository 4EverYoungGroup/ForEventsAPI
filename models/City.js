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
    zip_code: {type: String, index: true},
    location: {
        type: { type: String},
        coordinates: [Number]
    },
    users: [{type: Schema.Types.ObjectId, ref: 'User'}]
});
citySchema.index({ "location": "2dsphere" });


//List Cities containt partial word in a city, province or country
citySchema.statics.listCity = function(id,queryText,city,province,country,zip_code,limit,location, fields, sort){
    let filter = {};
    let filterLocation = {};
    let filterReturn = {};

    if (queryText) {
        
        if (queryText.length > 2){
        filter = {
            $or:
                [
                    { city: { $regex: new RegExp(queryText, "ig") } },
                    { province: { $regex: new RegExp(queryText, "ig") } },
                    { zip_code: { $regex: new RegExp(queryText, "ig") } },
                    { country: { $regex: new RegExp(queryText, "ig") } }
                ]
        };
        
    } };

    if (city){
        if (city.length < 3) return  {code: 400, ok: false, message: 'error in the search. 3 characters are required minimum'};
        filter.city = { $regex: new RegExp(city, "ig") };
    }
    if (province){
        if (province.length < 3) return  {code: 400, ok: false, message: 'error in the search. 3 characters are required minimum'};
        filter.province = { $regex: new RegExp(province, "ig") };
    }
   if (zip_code){
    if (zip_code.length < 3) return  {code: 400, ok: false, message: 'error in the search. 3 characters are required minimum'};
        filter.zip_code = { $regex: new RegExp(zip_code, "ig") };
   };
   if (country){
    if (country.length < 3) return  {code: 400, ok: false, message: 'error in the search. 3 characters are required minimum'};
        filter.country = { $regex: new RegExp(country, "ig") };
    };
    if (id){
        if (id.length !== 24) return  {code: 400, ok: false, message: 'error in the search. 3 characters are required minimum'};
            filter._id = id;
       };

    if (location){
        let locationS = location.split(',')
      if (locationS.length === 3){
          const long = locationS[1];
          const lat = locationS[0];
          const distance_m = locationS[2];
          filterLocation.location = { $nearSphere: {
              $geometry: {type: 'Point', coordinates: [long, lat]},
          $maxDistance: distance_m }
          };
      }
    };
    if (Object.keys(filterLocation).length !== 0 && Object.keys(filter).length !== 0) {
        filterReturn = {
            $and: [
                filterLocation,
                filter
            ]
        };
    }else if (Object.keys(filter).length !== 0) {filterReturn = filter;}

    else if (Object.keys(filterLocation).length !== 0){ filterReturn = filterLocation;}

    else  {
       return  {code: 400, ok: false, message: 'error in the search. 3 characters are required minimum'};
    };
    const query = City.find(filterReturn);
    query.limit (limit);
    if (fields){
        query.select(fields);
    };
    if (sort){
        query.sort(sort);
    }

    return query.exec();
};

//Search Cities for proximity
//lat = latitude, long = longitude, discance_m = distance in meters
citySchema.statics.nearMe = function(long, lat, distance_m){
    const distance =  City.find({ location: { $nearSphere: {
         $geometry: {type: 'Point', coordinates: [long, lat]},
     $maxDistance: distance_m }
     }});
 
     return distance.exec();
 }

//Insert New City
citySchema.statics.insertCity = function(city,cb){
    city._id = new mongoose.Types.ObjectId();
    city.save((err, citySaved)=> {
            if (err) {
               return cb({ code: 500, ok: false, message: 'error saving City'}); 
           } else {
               return cb(null,citySaved);
            }
        });    
};

//Update list of users (Add) when insert a new User
citySchema.statics.insertUser = function(cityId,userId,cb){
    City.findOneAndUpdate({_id: cityId}, 
            { $push: { users: userId } },
           function (error, success) {
                 if (error) {
                    return cb({ code: 500, ok: false, message: 'error saving User'}); 
                 } else {
                    return cb(null,success);
                 }
             });
}
//Update list of users (Delete) when Delete a User
citySchema.statics.deleteUser = function(cityId,userId,cb){
    City.findOneAndUpdate({_id: cityId}, 
            { $pull: { users: userId }}, {safe: true, upsert: true},
           function (error, success) {
                 if (error) {
                    return cb({ code: 400, ok: false, message: 'error_deleting_User'}); 
                } else {
                    return cb(null,success);
                 }
             });
}

citySchema.statics.listProvince = function(country){
   const groupProvince = City.aggregate([
        
        {$match: { "country": country }} ,
        
        {$group: {
            _id: '$province',
            country: {'$first':'$country'}, //$region is the column name in collection
            count: {$sum: 1}
            }}
        
    ]);
    
    groupProvince.sort('_id');
    return groupProvince.exec()
}

citySchema.statics.listCountries = function(){
    const groupCountry = City.aggregate([
         {$group: {
             _id: '$country',
             count: {$sum: 1}
             }}
         
     ]);
     
     groupCountry.sort('_id');
     return groupCountry.exec()
 }


//Create model
const City = mongoose.model('City', citySchema);

//and export model
module.exports = City;
