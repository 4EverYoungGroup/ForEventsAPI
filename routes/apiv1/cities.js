'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const User = require('../../models/User');
const City = require('../../models/City');


const mongoose = require('mongoose');
var Schema = mongoose.Schema;


//List of cities
router.get('/', async (req, res, next) => {
    try{
        const queryText = req.query.queryText;
        const city = req.query.city;
        const province = req.query.province;
        const country =  req.query.country;
        const zip_code = req.query.zip_code;
        const limit = parseInt(req.query.limit) || 25;
        const nearMe = req.query.nearMe;
        const fields = req.query.fields;

        var list = await City.listCity(queryText,city,province,country,zip_code,limit, nearMe, fields);
        if(list.code){res.json({ok: false, result: list});};
        res.status(200).json({ok: true, result: list});
    } catch (err){
        res.status(400).json({ok: false, result: err});
    }
});

router.get('/provinces', async (req, res, next) => {
    try{
        const country = req.query.country;
        var list = await City.listProvince(country);
        res.status(200).json({ok: true, result: list});
    } catch (err){
        res.status(400).json({ok: false, result: err});
    }
});

router.get('/countries', async (req, res, next) => {
    try{
        var list = await City.listCountries();
        res.status(200).json({ok: true, result: list});
    } catch (err){
        res.status(400).json({ok: false, result: err});
    }
});

// Insert New City
/*router.post('/',  (req,res,next) => {
    
    const name = req.query.name;
    if (name === "yes"){
        var city = new City({
            city: 'Aguadulce',
            province: 'Sevilla',
            country: 'Spain',
            location: {
                type: 'Point',
                coordinates: [-4.9798836683, 37.2506939087951]
            }     
        });
        var insert = City.insertCity(city);

        return res.json({ok: true, result: insert});     
    } else if (name === "2"){
        try{
            var insertUser = City.insertUser("5bddcd17e78c170bbcc27344","5bddcd17e78c170bbcc27344");
            return res.json({ok: true, result: insert});
        }catch (err){
            return res.json({ok: false, result: "KO"});
        };
        
    };
});*/


module.exports = router;
