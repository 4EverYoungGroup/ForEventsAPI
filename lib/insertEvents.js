'use strict';

const mongoose = require('mongoose');
const Event = require('../models/Event');

function mainInsert(req) {
    const begin_date = req.query.begin_date;
    const end_date = req.query.end_date;
    const adress = req.query.adress;
    const city = req.query.city;
    const province = req.query.province;
    const country = req.query.country;
    const indoor = req.query.indoor;
    const max_visitors = req.query.max_visitors;
    const free = req.query.free;
    const price = req.query.price;
    const min_age = req.query.min_age;
    const description = req.query.description;
    const location = req.query.location;
    const organizer = req.query.organizer;

    const valErrors = [];
    const regex = /^\s*(true|1|false|0)\s*$/

    if (begin_date) {
        const d = new Date(begin_date);
        const u = new Date();
        if (u > d) {
            valErrors.push({ field: 'begin_date', message: ' date is less than today' });
        } else {
            //valErrors.push({ field: 'begin_date', message: ' date is good'});
        }
    } else {
        valErrors.push({ field: 'begin_date', message: ' date required' });
    };
    if (end_date) {
        const d = new Date(end_date);
        const u = new Date();
        if (u > d) {
            valErrors.push({ field: 'end_date', message: ' date is less than today' });
        } else {
            // valErrors.push({ field: 'end_date', message: ' date is good'});
        }
    } else {
        valErrors.push({ field: 'end_date', message: ' date required' });
    };
    if (end_date < begin_date) {
        valErrors.push({ field: 'end_date', message: ' end date is less than begin' });
    }

    if (!city) { valErrors.push({ field: 'city', message: 'city is required' }); };

    if (price) {
        if (isNaN(Number(price))) { valErrors.push({ field: 'price', message: 'price, The value not is a number' }); };
    };
    if (min_age) {
        if (isNaN(Number(min_age))) { valErrors.push({ field: 'min_age', message: 'min_age, The value not is a number' }); };
    };
    if (max_visitors) {
        if (isNaN(Number(max_visitors))) { valErrors.push({ field: 'max_visitors', message: 'max_visitors, The value not is a number' }); };
    };
    if (!organizer || organizer.length !== 24) {
        valErrors.push({ field: 'organizer', message: 'organizer, The value  is required or not valid' });
    };
    if (indoor) {
        if (!regex.test(indoor)) valErrors.push({ field: 'indor', message: 'indoor, accepted values: true, 1, false, 0' });

    };
    if (free) {
        if (!regex.test(free)) valErrors.push({ field: 'free', message: 'free, accepted values: true, 1, false, 0' });
    };

    if (!location) {
        valErrors.push({ field: 'location', message: 'location, The value  is required' });
    } else {
        const values = location.split(',');
        console.log(values);
        if (values.length !== 2) {
            valErrors.push({ field: 'location', message: 'location, required 2 values: longitude, latitude' });
        } else {
            if (isNaN(Number(values[0])) || isNaN(Number(values[1]))) { valErrors.push({ field: 'location', message: 'The value not is a number' }); };
        };
    };

    if (valErrors.length === 0) {
        const valuesLoc = location.split(',');
        var event = new Event({
            begin_date: begin_date,
            end_date: end_date,
            adress: adress,
            city: city,
            province: province,
            country: country,
            indoor: indoor,
            max_visitors: max_visitors,
            free: free,
            price: price,
            min_age: min_age,
            description: description,
            location: {
                type: 'Point',
                coordinates: [valuesLoc[0], valuesLoc[1]]
            },
            organizer: organizer
        });
        return [null, event]
    } else {
        return [valErrors, null]
    };

};
module.exports = mainInsert;