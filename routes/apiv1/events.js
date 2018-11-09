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
var Schema = mongoose.Schema;

//List all events
router.get('/', async (req, res, next) => {
  try {
    const typeQuery = req.query.typeQuery;
    if (typeQuery === "exists") {
      try {
        const queryId = req.query.queryId;
        var exists = await Event.existsId(queryId);
        res.json({ succes: true, result: exists });
      } catch (error) {
        exists = 0;
        res.json({ succes: true, result: exists });
      }
    } else {
      const limit = parseInt(req.query.limit);
      const skip = parseInt(req.query.skip);
      const sort = req.query.sort;
      const fields = req.query.fields;
      const organizer = req.query.organizer;
      const media = req.query.media;
      const user = req.query.user;
      const event_type = req.query.event_type;
      const transaction = req.query.transaction;
      const filter = mainSearch(req);
      const list = await Event.list(filter, limit, skip, sort, fields, organizer, media, user, event_type, transaction);
      const rowsCount = await Event.countTot(filter)

      if (req.query.includeTotal === 'true') {

        res.json({ succes: true, total: rowsCount, result: list });

      } else {

        res.json({ succes: true, result: list });

      };
    }
  } catch (err) {
    next(err);
  }
});

//Insert a new Event
router.post('/', async (req, res, next) => {
  //Create an Event in memory
  const filter = mainInsert(req)

  if (filter[0] != null) {
    return res.json({ succes: false, result: filter[0] });
  } else {
    const valOrganizer = filter[1].organizer;
    const exists = await User.userProfileS(valOrganizer.toString(), 'Organizer');

    if (exists === 1) {
      Event.insertEvent(filter[1], function (err, result) {
        if (err) return res.status(400).json(err);
        // Event created
        return res.status(200).json({ succes: true, message: 'Event_registered', data: result });
      });
    } else {
      res.status(400).json({ succes: false, message: 'Unauthorized user to manage events' });
    };
  };
});


router.put('/:id', async (req, res, next) => {
  const updateEvent = mainUpdate(req);
  //console.log('Retorno del update: ' + updateEvent[1])
  if (updateEvent[0] != null) {
    return res.status(400).json({ succes: false, result: updateEvent[0] });
  } else {
    try {
      const _id = req.params.id;
      const eventUpdated = await Event.findOneAndUpdate({ _id: _id }, updateEvent[1], { new: true }).exec();
      res.status(200).json({ success: true, result: eventUpdated });
    } catch (err) {
      next(err);
    }
  }

});

router.delete('/:id', async (req, res, next) => {

  const _id = req.params.id;
  const profile = req.query.profile;
  const organizer = req.query.organizer;
  if (_id && profile && organizer) {
    const exists = await User.userProfileS(organizer, profile);
    if (exists === 1) {
      try {
        await Event.deleteEvent({ _id: _id });
        return res.status(200).json({ succes: true, message: 'Event_deleted' });
      } catch (err) {
        next(err);
      }
    } else {
      res.status(400).json({ succes: false, message: 'Unauthorized user to manage events' });
    };

  } else {
    res.status(400).json({ succes: false, message: 'Incomplete data' });
  };

});



module.exports = router;