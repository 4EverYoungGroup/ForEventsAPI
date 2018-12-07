'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const Event = require('../../models/Event');
const User = require('../../models/User');
const mongoose = require('mongoose');
const mainSearchFavorite = require('../../lib/searchFavorite');
const Favorite_search = require('../../models/Favorite_search');

var Schema = mongoose.Schema;

//List all events
router.get('/', async (req, res, next) => {
    try{
        const filter = {};
        const user = req.query.userId;
        const name_search = req.query.name_search;
        
        if (user){
            filter.user = user;
            
            if (name_search){
                filter.name_search = { $regex: new RegExp(name_search, "ig") };
            } 
            
        }else{
            res.status(400).json({ok: false, result: "User is required"});
        }

        const limit = parseInt(req.query.limit);
        const skip = parseInt(req.query.skip);
        const sort = req.query.sort;
        const fields = req.query.fields;
    
        const list = await Favorite_search.list(filter,limit, skip, sort, fields);

        const rowsCount = await Favorite_search.countTot(filter)
       
        if (req.query.includeTotal === 'true'){
        
        res.status(200).json({ok: true,total: rowsCount, result: list});

       }else{

        res.status(200).json({ok: true, result: list});

       };   
    
    } catch (err){
        res.status(400).json({ok: false, result: err});
    }
});

//Insert a new Favorite_search
router.post('/', async(req,res,next) => {
    //Create an Event in memory
    //const filter = JSON.stringify(mainSearch(req));
    const filter = JSON.stringify(req.query);
    const userId = req.query.userId;
    var name_search = req.query.name_search;
    if (name_search && userId){
        const totReg = await Favorite_search.count({name_search: name_search}).exec();
        if (totReg>0){
            const random = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
            name_search = name_search + '_' + (random);
        };
        Favorite_search.insertFavorite_search(userId, filter, name_search, function(err, result){
            if (err) return res.status(400).json({ok: false, result: err});

            //Insert Favorite_search in User
            User.insertFavorite_search(result.user,result._id, function(err, result2){
                if (err){return cb({ code: 400, ok: false, message: 'error saving Favorite_search in User' + err});};
                return res.status(200).json({ ok: true, message: 'Event_registered', data: result});
            });
            //console.log(JSON.parse(result.query))   
        });
    }else{

    }; 
  });


router.delete('/:id', async (req,res, next) =>{
    const _id = req.params.id;
    const userId = req.query.userId;

    if (_id && userId){
        try{            
            //Delete Favorite_search in User
        User.deleteFavorite_search(userId,_id, function(err, result2){
            if (err){return res.status(400).json({ code: 400, ok: false, message: 'error deleting Favorite_search in User' + err});};
           
            return res.status(200).json({ ok: true, message: 'Event_deleted' }); 
        });
        
        await Favorite_search.deleteFavorite_Search({_id });
       
    }catch(err){
            res.status(400).json({ok: false, message: err});
        }
    }else{
    res.status(400).json({ok: false, message: 'Incomplete data'});
};
    
});


module.exports = router;
