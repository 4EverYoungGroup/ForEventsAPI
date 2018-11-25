'use strict';

const mongoose = require('mongoose');
const User = require('./User');
const async = require('async');

var Schema = mongoose.Schema;

//first, we created the scheme
const citySchema = Schema({
    _id: Schema.Types.ObjectId,
    city: { type: String, index: true },
    province: { type: String, index: true },
    country: { type: String, index: true },
    zip_code: { type: String, index: true },
    location: {
        type: { type: String },
        coordinates: [Number]
    },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});
citySchema.index({ "location": "2dsphere" });


//List Cities containt partial word in a city, province or country
citySchema.statics.listCity = function (queryText, limit, location, fields) {
    //let regex = new RegExp(search,'ig');
    let filter = {};
    let filterLocation = {};
    let filterReturn = {};

    if (queryText) {

        if (queryText.length > 2) {
            filter = {
                $or:
                    [
                        { city: { $regex: new RegExp(queryText, "ig") } },
                        { province: { $regex: new RegExp(queryText, "ig") } },
                        { zip_code: { $regex: new RegExp(queryText, "ig") } },
                        { country: { $regex: new RegExp(queryText, "ig") } }
                    ]
            };

        } else {
            filter = {};
        }

    };

    if (location) {
        let locationS = location.split(',')
        if (locationS.length === 3) {
            const long = locationS[1];
            const lat = locationS[0];
            const distance_m = locationS[2];
            filterLocation.location = {
                $nearSphere: {
                    $geometry: { type: 'Point', coordinates: [long, lat] },
                    $maxDistance: distance_m
                }
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
    } else if (Object.keys(filter).length !== 0) { filterReturn = filter; }

    else if (Object.keys(filterLocation).length !== 0) { filterReturn = filterLocation; }

    else {
        return { code: 400, ok: false, message: 'error in the search. 3 characters are required minimum' };
    };
    const query = City.find(filterReturn);
    query.limit(limit);
    if (fields) {
        query.select(fields)
        console.log(fields)
    };
    return query.exec();
};

//Search Cities for proximity
//long = longitude, lat = latitude, discance_m = distance in meters
citySchema.statics.nearMe = function (long, lat, distance_m) {
    const distance = City.find({
        location: {
            $nearSphere: {
                $geometry: { type: 'Point', coordinates: [long, lat] },
                $maxDistance: distance_m
            }
        }
    });

    return distance.exec();
}

//Insert New City
citySchema.statics.insertCity = function (city, cb) {
    city._id = new mongoose.Types.ObjectId();
    city.save((err, citySaved) => {
        if (err) {
            return cb({ code: 500, ok: false, message: 'error saving City' });
        } else {
            return cb(null, citySaved);
        }
    });
};


//Update list of users (Add) when insert a new User
citySchema.statics.insertUser = function (cityId, userId, cb) {
    City.findOneAndUpdate({ _id: cityId },
        { $push: { users: userId } },
        function (error, success) {
            if (error) {
                return cb({ code: 500, ok: false, message: 'error saving User' });
            } else {
                return cb(null, success);
            }
        });
}



//Create model
const City = mongoose.model('City', citySchema);

//and export model
module.exports = City;
