'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const Event_type = require('../../models/Event_type');
const Event = require('../../models/Event');
const Favorite_search = require('../../models/Favorite_search');

const mongoose = require('mongoose');
var Schema = mongoose.Schema;



// Insert New event_type
router.post('/', (req,res,next) => {
    const name = req.query.name;
    if (name){
        var event_type = new Event_type({
            name: name
        });
        
        Event_type.insertEvent_type(event_type, function(err, result){
            if (err) return result.status(400).json({ok: false, message: 'Error Event_type_NOT_registered', err});
            // Event created
            return res.status(200).json({ ok: true, message: 'Event_type_registered', data: result });
        });   
    };
});

router.get('/', async (req, res, next) => {
    try{
    // const name = req.query.name;
    // const id = req.query.id;
    const list = await Event_type.list(req);
    res.status(200).json({ok: true, result: list});

    //     res.json({ok: true, result: list});
    // if (!name && !id){  
    //     const list = await Event_type.list();
    //     res.json({ok: true, result: list});
    // } else if(name){
    //     const list = await Event_type.list('',name);
    //     res.status(200).json({ok: true, result: list});
   
    // } else {
    //     const list = await Event_type.list(id);
    //     res.status(200).json({ok: true, result: list});
    // }
    } catch (err){
        next(err);
    }
});



module.exports = router;
