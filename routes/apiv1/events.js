'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = mongoose.model('Event');

// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
router.use(jwtAuth());

router.get('/', (req, res, next) => {

  //console.log('jwt decoded', req.decoded);

  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // this api return max 1000 registers
  const sort = req.query.sort || '_id';
  const includeTotal = req.query.includeTotal === 'true';
  const filters = {};
  if (typeof req.query.tag !== 'undefined') {
    filters.tags = req.query.tag;
  }


  if (typeof req.query.name !== 'undefined') {
    filters.nombre = new RegExp('^' + req.query.name, 'i');
  }

  Event.list(start, limit, sort, includeTotal, filters, function (err, result) {
    if (err) return next(err);
    res.json({ ok: true, result: result });
  });
});

// Return the list of available tags
router.get('/profiles', function (req, res) {
  res.json({ ok: true, allowedTags: Event.allowedTags() });
});

router.get('/near', function(req, res, next) {
  const METERS_PER_KM = 1000; 
  Event.find({
              location: {
              $nearSphere: { $geometry: { type: 'Point', coordinates: [ -73.93414657, 40.82302903 ] },
              $maxDistance: 5 * METERS_PER_KM
             }
  } }, function(err, rows) {
                           });
});

module.exports = router;
