'use strict';

const mongoose = require('mongoose');
const Event = require('../models/Event');

const async = require('async');

function mainSearch(req){

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
    const event_type = req.query.event_typeId
    const name = req.query.name;
    const description = req.query.description;
    const name_description = req.query.name_description;
    const zip_code = req.query.zip_code;

    let filter = {};

    if (active_event == undefined || active_event === 'true'){
        const d = new Date();
        const n = d.toISOString();
        filter.end_date = {$gte: n};
    };
    if (begin_date){
        //format date YYYY-MM-DD
        const d = new Date(begin_date);
        const n = d.toISOString();
        filter.begin_date = {$gte: n};
    };
    if (end_date){
        //format date YYYY-MM-DD
        const d = new Date(end_date);
        const n = d.toISOString();
        filter.end_date = {$lte: n};
    };
    if (city){
        filter.city = { $regex: new RegExp(city, "ig") };
        //filter.city = {$regex: new RegExp('^' + city.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')};
    };
    if (province){
        filter.province = { $regex: new RegExp(province, "ig") };
        //filter.province = {$regex: new RegExp('^' + province.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')};
    };
    if (country){
        filter.country = { $regex: new RegExp(country, "ig") };
    };
    if (name){
        filter.name = { $regex: new RegExp(name, "ig") };
    };
    if (description){
        filter.description = { $regex: new RegExp(description, "ig") };
        //filter.province = {$regex: new RegExp('^' + province.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')};
    };
    //if (name_description){
       // filter =($or({ $regex: new RegExp(name, "ig") }, { $regex: new RegExp(description, "ig") }));// [{ $regex: new RegExp(name, "ig") }, { $regex: new RegExp(description, "ig") }];
    //};
    if (indoor){
        filter.indoor = indoor;
    };
    if (free){
        filter.free = free;
    };
    if (min_age){
        const n = parseInt(min_age);
        filter.min_age = {$gte: n};
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
      if (location){
          let locationS = location.split(',')
          console.log(locationS);
        if (locationS.length === 3){
            const long = locationS[0];
            const lat = locationS[1];
            const distance_m = locationS[2];
            filter.location = { $nearSphere: {
                $geometry: {type: 'Point', coordinates: [long, lat]},
            $maxDistance: distance_m }
            };
        }
      };
      if(event_type){
        if (event_type.length === 24){
            filter.event_type = event_type;
        };
      };
      if (zip_code){
        if (zip_code.length === 5){
            filter.zip_code = zip_code;
        }
    };

    return filter;
}

module.exports = mainSearch;