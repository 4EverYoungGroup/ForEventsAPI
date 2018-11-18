'use strict';

const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const countrySchema = mongoose.Schema({
    name: { type: String, index: true },
});


countrySchema.statics.exists = function (idCountry, cb) {
    Country.findById(idCountry, function (err, country) {
        if (err) return cb(err);
        return cb(null, country ? true : false);
    });
};

countrySchema.statics.createRecord = function (newCountry, cb) {


    Country.findOne({ name: newCountry.name }, function (err, country) {

        if (err) {
            return cb(err);
        }

        // country already exists
        if (country) {
            return cb({ ok: false, message: 'country_already_exists' });
        } else {


            // Create country
            new Country(newCountry).save(cb);


        }
    });

};

// We create a static method to search for countries
// The search can be paged and ordered
countrySchema.statics.getList = function (filters, limit, skip, sort, fields, includeTotal, cb) {

    const query = Country.find(filters);
    query.limit(limit);
    query.skip(skip);
    query.sort(sort);
    query.select(fields);



    return query.exec(function (err, rows) {
        if (err) return cb(err);

        const result = {
            rows: rows,
        };

        if (!includeTotal) return cb(null, result);

        // incluir propiedad total
        Country.count(filters, (err, total) => {
            if (err) return cb(err);
            result.total = total;
            return cb(null, result);
        });
    });
}

var Country = mongoose.model('Country', countrySchema);

module.exports = Country;

