'use strict';

const mongoose = require('mongoose');
const configAnuncios = require('../local_config').events;
const fs = require('fs');
//const flow = require('../lib/flowControl');

const eventSchema = mongoose.Schema({
  name: { type: String, index: true },
  description: { type: String, index: true },
  begin_time: { type: Date, index: true},
  end_time: { type: Date, index: true},
  location: {
    type: { type:String},
    coordinates: [Number]
  },
  profile: { type: [String], index: true },
  address: { type: String, index: true},
  city: { type: String, index: true},
  zip_code: { type: Number, index: true},
  province: { type: String, index: true},
  country: { type: String , index: true},
  indoor: { type: Boolean, index: true},
  max_visitors: { type: Number, index: true},
  free: { type: Boolean, index: true},
  price: { type: Number, index: true},
  create_time: { type: Date, index: true},
  min_age: { type: Number, index: true},
});

eventSchema.index({location: '2dsphere'})

/**
 * list of profile allowed
 */
eventSchema.statics.allowedTags = function () {
  return ['user', 'admin', 'promotor'];
};

eventSchema.statics.list = function (startRow, numRows, sortField, includeTotal, filters, cb) {

  const query = Event.find(filters);

  query.sort(sortField);
  query.skip(startRow);
  query.limit(numRows);


  return query.exec(function (err, rows) {
    if (err) return cb(err);

    // poner prefijo a imagenes
    /* rows.forEach((row) => {
      if (row.foto) {
        row.foto = configAnuncios.imagesURLBasePath + row.foto;
      }
    }); */

    const result = { rows: rows };

    if (!includeTotal) return cb(null, result);

    // incluir propiedad total
    Event.count({}, (err, total) => {
      if (err) return cb(err);
      result.total = total;
      return cb(null, result);
    });
  });
};

var Event = mongoose.model('Event', eventSchema);
