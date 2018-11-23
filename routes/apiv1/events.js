'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const Event = require('../../models/Event');
const User = require('../../models/User');
const mongoose = require('mongoose');
const mainSearch = require('../../lib/searchEvents');
const mainInsert = require('../../lib/insertEvents');
const mainUpdate = require('../../lib/updateEvents');
const Event_type = require('../../models/Event_type');
var Schema = mongoose.Schema;

//List all events
router.get('/', async (req, res, next) => {
    try{
    const typeQuery = req.query.typeQuery;
    if (typeQuery === "exists"){  
        try{
            const queryId = req.query.queryId;
            var exists = await Event.existsId(queryId);
            res.json({ok: true, result: exists});
        }catch(error){
            exists = 0;
            res.status(200).json({ok: true, result: exists});
        }
    } else {
        const limit = parseInt(req.query.limit);
        const skip = parseInt(req.query.skip);
        const sort = req.query.sort;
        const fields = req.query.fields;
        const organizer = req.query.organizer;
        const media = req.query.media;
        const users = req.query.users;
        const event_type = req.query.event_type;
        const transactions = req.query.transactions;
        const filter = mainSearch(req);
        const event_typeName = req.query.event_typeName;
        if (event_typeName){
            
            const result = await Event_type.list(null, event_typeName);
            if (result){
                filter.event_type = result._id;
            } else{
                res.status(400).json({ok: false, message: 'Event Type not found'});
            };
            
        };
        const list = await Event.list(filter,limit, skip, sort, fields, organizer, media, users, event_type, transactions);
        const rowsCount = await Event.countTot(filter)
       
        if (req.query.includeTotal === 'true'){
        
        res.status(200).json({ok: true,total: rowsCount, result: list});

       }else{

        res.status(200).json({ok: true, result: list});

       };   
    }
    } catch (err){
        next(err);
    }
});

//Insert a new Event
router.post('/', async(req,res,next) => {
    //Create an Event in memory
    const filter = mainInsert(req) 
    if (filter[0] != null){
        return res.status(400).json({ok: false, result: filter[0]});
       }else{
        const valOrganizer = filter[1].organizer;
        const exists = await User.userProfileS(valOrganizer.toString(), 'Organizer');
        //Only a Organizer rol can insert new events
        if (exists === 1){
            Event.insertEvent(filter[1], function (err, result){
                if (err) return res.status(400).json({ok: false, result: err});
                // Event created
                // We need assign event Id into collection event_type
                const eventId = result._id;
                const event_typeId = result.event_type;
                if (eventId && event_typeId ){
                Event_type.event_typeExists(event_typeId.toString(), function (err, resultType){
                    if (resultType === 1){
                        //(event_typeId, eventId)
                        Event_type.insertEvent(event_typeId, eventId, function(err, resultInsert){
                            if (err) return res.status(400).json({ok: false, result: err});

                            return res.status(200).json({ ok: true, message: 'Event_registered', data: result});
                        });
                       
                    }else{
                        return res.status(400).json({ok: false, message: 'Event_type not found'});
                    };    
                });
                
                } else {
                   return res.status(400).json({ok: false, message: 'Event_type not found'});
                };       
           });
        }else{
            return res.status(400).json({ok: false, message: 'Unauthorized user to manage events'});
        };
       };
  });


router.put('/:id', async (req,res, next) =>{
    const updateEvent = mainUpdate(req);

    if (updateEvent[0] != null){
        return res.status(400).json({ok: false, result: updateEvent[0]});
       }else{
        try{
            const _id = req.params.id; 
            const eventUpdated = await Event.findOneAndUpdate({_id: _id}, updateEvent[1], {new:true}).exec();
            res.status(200).json({ok: true, result: eventUpdated});
         } catch (err){
             next(err);
         }
       }
});

router.delete('/:id', async (req,res, next) =>{
    const _id = req.params.id;
    const profile = req.query.profile;
    const organizer = req.query.organizer;
    if (_id && profile && organizer){
        try{
            const exists = await User.userProfileS(organizer, profile);
            if (exists === 1){
                try{
                    await Event.deleteEvent({_id: _id });
                    return res.status(200).json({ ok: true, message: 'Event_deleted' });
                }catch (err){
                    res.status(400).json({ok: false, message: err});
                }
            }else {
                res.status(400).json({ok: false, message: 'Unauthorized user to manage events'});
            };
        }catch{
            res.status(400).json({ok: false, message: 'Unauthorized user or profile'});
        }
    }else{
    res.status(400).json({ok: false, message: 'Incomplete data'});
};
    
});

module.exports = router;
