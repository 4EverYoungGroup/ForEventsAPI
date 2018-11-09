'use strict';

const mongoose = require('mongoose');

function mainSearch(req) {

    const begin_date = req.query.begin_date;
    const end_date = req.query.end_date;
    const city = req.query.city;
    const province = req.query.province;
    const country = req.query.country;
    const indoor = req.query.indoor;
    const free = req.query.free;
    const price = req.query.price;
    const min_age = req.query.min_age;
    const active_event = req.query.active_event;
    const location = req.query.location;

    let filter = {};

    if (active_event == undefined || active_event === 'true') {
        const d = new Date();
        const n = d.toISOString();
        filter.end_date = { $gte: n };
    };
    if (begin_date) {
        //format date YYYY-MM-DD
        const d = new Date(begin_date);
        const n = d.toISOString();
        filter.begin_date = { $gte: n };
    };
    if (end_date) {
        //format date YYYY-MM-DD
        const d = new Date(end_date);
        const n = d.toISOString();
        filter.end_date = { $lte: n };
    };
    if (city) {
        filter.city = { $regex: new RegExp(city, "ig") };
        //filter.city = {$regex: new RegExp('^' + city.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')};
    };
    if (province) {
        filter.province = { $regex: new RegExp(province, "ig") };
        //filter.province = {$regex: new RegExp('^' + province.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')};
    };
    if (country) {
        filter.country = { $regex: new RegExp(country, "ig") };
        //filter.province = {$regex: new RegExp('^' + province.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')};
    };
    if (indoor) {
        filter.indoor = indoor;
    };
    if (free) {
        filter.indoor = free;
    };
    if (min_age) {
        const n = parseInt(min_age);
        filter.min_age = { $gte: n };
    };
    if (typeof price !== 'undefined' && price !== '-') {
        if (price.indexOf('-') !== -1) {
            filter.price = {};
            let range = price.split('-');
            if (range[0] !== '') {
                filter.price.$gte = range[0];
            }

            if (range[1] !== '') {
                filter.price.$lte = range[1];
            }
        } else {
            filter.price = price;
        }
    }
    if (location) {
        let locationS = location.split(',')
        console.log(locationS);
        if (locationS.length === 3) {
            const long = locationS[0];
            const lat = locationS[1];
            const distance_m = locationS[2];
            filter.location = {
                $nearSphere: {
                    $geometry: { type: 'Point', coordinates: [long, lat] },
                    $maxDistance: distance_m
                }
            };
        }

    };

    return filter;
}
module.exports = mainSearch;