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
    try {
        const nombre = req.query.inserta;
        if (nombre === "total") {
            var list = await City.listCity('Ag');

            res.json({ ok: true, result: list });
        } else if (nombre === "distance") {
            const met = 1400000;
            const lon = 1.995355;
            const lat = 41.789554;
            const list = await City.nearMe(lon, lat, met);
            res.json({ ok: true, result: list });

        } else {
            res.send('Hello World 4events');
        }
    } catch (err) {
        next(err);
    }
});


// Insert New City
router.post('/', (req, res, next) => {

    const name = req.query.name;
    if (name === "yes") {
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

        return res.json({ ok: true, result: insert });
    } else if (name === "2") {
        try {
            var insertUser = City.insertUser("5bddcd17e78c170bbcc27344", "5bddcd17e78c170bbcc27344");
            return res.json({ ok: true, result: insert });
        } catch (err) {
            return res.json({ succes: false, result: "KO" });
        };

    };
});



module.exports = router;