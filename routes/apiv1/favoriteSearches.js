'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const Event = require('../../models/Event');
const User = require('../../models/User');
const mongoose = require('mongoose');
//const mainSearchFavorite = require('../../lib/searchFavorite');
const Favorite_search = require('../../models/Favorite_search');

var Schema = mongoose.Schema;

//List all events
router.get('/', async (req, res, next) => {
    try{
        const filter = {};
        const user = req.query.userId;
        const name = req.query.name;
        
        if (user){
            filter.user = user;
            
            if (name){
                filter.name = { $regex: new RegExp(name, "ig") };
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
    var name = req.query.name;
    if (name && userId){
        const totReg = await Favorite_search.count({name: name}).exec();
        if (totReg>0){
            const random = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
            name = name + '_' + (random);
        };
        Favorite_search.insertFavorite_search(userId, filter, name, function(err, result){
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

router.get('/push', async (req, res, next) => {
    var users = [];
    const newEvent = req.query.newEvent;
    const userId = req.query.userId;

    const usuarios = User.find().cursor().eachAsync( async function(user){    
        const favorites = user.favorite_searches;
        if (favorites.length >0){
            favorites.forEach( async function (filterResult){
                const filterquery = {};
                const filterPrueba = {};
                filterquery._id = filterResult;
                Favorite_search.findOne(filterquery, async function(err, resultFilter){
                   
                    if (err) return res.status(400).json({ok: true, result: err});
                    const var1 = JSON.parse(resultFilter.query);
                    console.log('name: ' + var1.name)
                    console.log('location: ' + var1.location)
                    filterPrueba.organizer = '5bdb5046280baa29fc4ab54d';

                    //console.log('var0' + var0);
                    //console.log('var1' + var1);
                    //var json = resultFilter.query.replace(/\'/g, ' ');
                    //json = resultFilter.query.replace(/"/g, ' ');
                    //const filter = mainSearchFavorite(var1);
                   // console.log('despues: ' + JSON.stringify(filter));
                    //console.log('Json: ' + JSON.parse(resultFilter.query));
                    //console.log('Json0: ' + resultFilter.query);
                    //console.log('Json1: ' + resultFilter.query.replace(/\'/g, ' '));
                    //const filter = resultFilter.query.replace(/\'/g, '"');
                    //console.log('Parse: ' + filter);
                    const mName ='Fiestas tuMariposa';
                    try{
                        const resultEvent =  await Event.findOne(filterPrueba).exec();
                        //const resultEvent =  await Event.list(userId,filterPrueba);
                            console.log('resultado: ' + resultEvent);
                            users.push(JSON.stringify(resultEvent));
                        
                        //return res.status(200).json({ ok: true, message: resultEvent});
                            //console.log('Event Result: ' + resultEvent.toString());
                            //res.status(400).json({ok: false, result: resultEvent});
                           // console.log('resultado: ' + JSON.stringify(resultEvent));
                            //users.push(resultEvent)
                    }catch(err) {
                        console.log('error: ' + err);
                        //res.status(400).json({ok: false, result: err});
                    }
                  
                    //console.log('Event: ' + filter);
                    //console.log('LQR: ' + resultFilter.query);
                    // var userMap = {};
                   
                    // users.forEach(function(user) {
                    //   userMap[user._id] = user;
                    // });
                
                    //users.push(resultado)
                });
                // listasR = await Favorite_search.list(filterquery,1000,0,'','-query');
                //const newList = new Favorite_search(listasR.favorite_searches.name);
                //const mirest.json({ok: true, result: listasR});
                //res.status(200).json({ok: true, result: listasR});
                //console.log('LQR: ' + listasR.name);
                //console.log('NQ: ' + user);
                //users.push(listasR);
                //res.status(200).json({ok: true, result: listasR});
                //console.log('filter: ' + filter);
            });
            //res.status(200).json({ok: true, result: usuarios});
        }
        
    });
    res.status(200).json({ok: true, result: users});
    


    //console.log(resultado);
    /*await Favorite_search.find().cursor().eachAsync(async function(favorite){
        var filter = JSON.parse(favorite.query) ;
        filter._id = _id;
        await Event.list(filter, , , ,'')
    });*/
    //next()
});




module.exports = router;
