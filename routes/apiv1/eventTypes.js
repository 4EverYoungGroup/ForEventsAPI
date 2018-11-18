'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const Event_type = require('../../models/Event_type');
const Event = require('../../models/Event');
const Favorite_search = require('../../models/Favorite_search');
const User = require('../../models/User');

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

    const list = await Event_type.list(req);
    res.status(200).json({ok: true, result: list});

    } catch (err){
        return result.status(400).json({ok: false, message: 'Error Event_type: ', err});
    }
});

router.put('/:id', async (req,res, next) =>{
    const name = req.query.name;
    const _id = req.params.id;
        if (name && _id){
            try{
                const eventTypeUpdated = await Event_type.findOneAndUpdate({_id: _id}, {$set: {name: name}}, {new:true}).exec();
                res.status(200).json({ok: true, result: eventTypeUpdated});
             } catch (err){
                return result.status(400).json({ok: false, message: 'Error Event_type: ', err});
             }

        } else{
            return result.status(400).json({ok: false, message: 'Error Event_type id or name request: ', err});
        };
        
       }
);

router.delete('/:id', async (req,res, next) =>{
    const _id = req.params.id;
    const admin = req.query.admin;
    if (_id && admin){
        try{
            const exists = await User.userProfileS(admin, "Admin");
            console.log('existe: '+ exists);
            if (exists === 1){
                try{
                    await Event_type.remove({_id: _id }).exec();
                    return res.status(200).json({ ok: true, message: 'Event_deleted' });
                }catch (err){
                    res.status(400).json({ok: false, message: err});
                }
            }else {
                res.status(400).json({ok: false, message: 'Unauthorized user to manage events'});
            };
        }catch(err){

            res.status(400).json({ok: false, message: 'Unauthorized user or profile'});
        }
    }else{
    res.status(400).json({ok: false, message: 'Incomplete data'});
};
    
});


module.exports = router;
