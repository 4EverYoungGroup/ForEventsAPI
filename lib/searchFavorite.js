'use strict';

const mongoose = require('mongoose');
const Event = require('../models/Event');

const async = require('async');

function mainSearchFavorite(req){

    const begin_date = req.begin_date;
    const end_date = req.end_date;
    const city = req.city;
    const province = req.province;
    const country = req.country;
    const indoor = req.indoor;
    const free = req.free;
    const price = req.price;
    const min_age = req.min_age;
    const active_event = req.active_event;
    const location = req.location;
    const event_type = req.event_typeId
    const name = req.name;
    const description = req.description;
    const queryText = req.queryText;
    const zip_code = req.zip_code;
    const id = req.id;
    const active = req.active;
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
   
   if (Object.keys(filterOR).length !== 0 && Object.keys(filter).length !== 0) {
        filterReturn = {
            $and: [
                filterOR,
                filter
            ]
        };
    }

    else if (Object.keys(filter).length !== 0) {filterReturn = filter}
    else if (Object.keys(filterOR).length !== 0){ filterReturn = filterOR};

    return filterReturn;
}

module.exports = mainSearchFavorite;
