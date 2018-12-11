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
    const queryText = req.query.queryText;
    const zip_code = req.query.zip_code;
    const id = req.query.id;
    const active = req.query.active;
    const organizerId = req.query.organizerId;
    const filter = {};
    let filterOR = {};
    let filterReturn ={};

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
        if (locationS.length === 3){
            const long = locationS[1];
            const lat = locationS[0];
            const distance_m = locationS[2];
            filter.location = { $nearSphere: {
                $geometry: {type: 'Point', coordinates: [long, lat]},
            $maxDistance: distance_m }
            };
        }
      };
      if(event_type){
          const event_typeId = event_type.split(',');
          filter.event_type = { "$in" : event_typeId} }
        //if (event_type.length === 24){
           // filter.event_type = event_type;
        //};
      //};

      if(id){
        if (id.length === 24){
            filter._id = id;
        };
      };

      if(organizerId){
        if (organizerId.length === 24){
            filter.organizer = organizerId;
        };
      };

      if(active){
        filter.active = active;
      } else{
          //filter.active = true
      };

      if (zip_code){
        if (zip_code.length === 5){
            filter.zip_code = zip_code;
        }
    };

    if (queryText) {
        filterOR = {
            $or:
                [
                    { name: { $regex: new RegExp(queryText, "ig") } },
                    { description: { $regex: new RegExp(queryText, "ig") } },
                    { zip_code: { $regex: new RegExp(queryText, "ig") } },
                    { city: { $regex: new RegExp(queryText, "ig") } }
                ]
        };
        
    };

   if (filterOR && filter) {
        filterReturn = {
            $and: [
                filterOR,
                filter
            ]
        };
    }

    else if (filter) {filterReturn = filter}
    else if (filterOR){ filterReturn = filterOR};

    return filterReturn;
}

module.exports = mainSearch;
