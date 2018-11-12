'use strict';

const mongoose = require('mongoose');
const Event = require('../models/Event');

function mainUpdate(req){

    const begin_date = req.body.begin_date;
    const end_date = req.body.end_date;
    const adress = req.body.adress;
    const city = req.body.city;
    const province = req.body.province;
    const country = req.body.country;
    const indoor = req.body.indoor;
    const max_visitors = req.body.max_visitors;
    const free = req.body.free;
    const price = req.body.price;
    const min_age = req.body.min_age;
    const description = req.body.description;
    const location = req.body.location;
    const organizer = req.body.organizer;
    const name = req.body.name;
    const zip_code = req.body.zip_code;
    
    
    
    const valErrors = [];
    var valUpdate = [];

    const regex=/^\s*(true|1|false|0)\s*$/
    
    if (begin_date){
        const d = new Date(begin_date);
        const u = new Date();
        if (u > d){
            valErrors.push({ field: 'begin_date', message: ' date is less than today'});
        }else{
            valUpdate.push ({ begin_date: begin_date});
        }
    };
    if (end_date){
        const d = new Date(end_date);
        const u = new Date();
        if (u > d){
            valErrors.push({ field: 'end_date', message: ' date is less than today'});
        }else{
            valUpdate.push ({ end_date: end_date});
        }
    };
    if (end_date && begin_date){
        if (end_date < begin_date){
            valErrors.push({ field: 'end_date', message: ' end date is less than begin'});
        }
    };
    
    if (adress){
        valUpdate.push ({ adress: adress});
    };
    
    if (city) {
        valUpdate.push ({ adress: adress});
    };
    if (province) {
        valUpdate.push ({ province: province});
    };
    if (country) {
        valUpdate.push ({ country: country});
    };
    if (price){
        if(isNaN(Number(price))){valErrors.push({ field: 'price', message: 'price, The value not is a number'})}else{
            valUpdate.push ({ price: price});
        };
        };
    if (min_age){
        if(isNaN(Number(min_age))){valErrors.push({ field: 'min_age', message: 'min_age, The value not is a number'})}else{    
            valUpdate.push ({ min_age: min_age});
        };
        };
    if (max_visitors){
        if(isNaN(Number(max_visitors))){valErrors.push({ field: 'max_visitors', message: 'max_visitors, The value not is a number'});}else{
            valUpdate.push ({ max_visitors: max_visitors});
        };
        };
    
    if (organizer){
       valErrors.push({ field: 'organizer', message: 'The organizer can not be modified'});
    };
    
    if (indoor){
        if (!regex.test(indoor))  {valErrors.push({ field: 'indor', message: 'indoor, accepted values: true, 1, false, 0'});}else{
            valUpdate.push ({ indoor: indoor});
        };
    };
    if (free){ 
        if (!regex.test(free))  {valErrors.push({ field: 'free', message: 'free, accepted values: true, 1, false, 0'});}else{
            valUpdate.push ({ free: free});
        };
    };
    
    if (name){
        if (name.length > 250){
            valErrors.push({ field: 'name', message: 'name, invalid value, exceeds 250 characters'});
        } else {
            valUpdate.push ({ name: name});
        }
    };
    
    if (description){
        if (description.length > 250){
            valErrors.push({ field: 'description', message: 'description, invalid value, exceeds 250 characters'});
        }else {
            valUpdate.push ({ description: description});
        }
    };
    
    if (zip_code){
        if (zip_code.length !== 5){
            valErrors.push({ field: 'zip_code', message: 'zip_code, invalid value, only accept 5 characters'});
        }else {
            valUpdate.push ({ zip_code: zip_code});
        }
    };

    if (location){
        const values = location.split(',');
        if (values.length !== 2){
            valErrors.push({ field: 'location', message: 'location, required 2 values: longitude, latitude'});
        } else{
            if(isNaN(Number(values[0])) || isNaN(Number(values[1]))){valErrors.push({ field: 'location', message: 'The value not is a number'});}else{
                valUpdate.push ({ location: {type:'Point',
                coordinates: [values[0], values[1]]}});
            };
        };
    };

    if (valErrors.length === 0){    
       const resultF = valUpdate.reduce(function(result, item) {
        var key = Object.keys(item)[0]; //first property: a, b, c
        result[key] = item[key];
        return result;
      }, {});
        var event = resultF;
        return [null, event]
    }else{
        return [valErrors, null]
    };
    
};

module.exports = mainUpdate;
