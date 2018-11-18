'use strict';

const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const provinceSchema = mongoose.Schema({
    name: { type: String, index: true },
});


provinceSchema.statics.exists = function (idProvince, cb) {
    Province.findById(idProvince, function (err, province) {
        if (err) return cb(err);
        return cb(null, province ? true : false);
    });
};

provinceSchema.statics.createRecord = function (newProvince, cb) {


    Province.findOne({ name: newProvince.name }, function (err, province) {

        if (err) {
            return cb(err);
        }

        // province already exists
        if (province) {
            return cb({ ok: false, message: 'province_already_exists' });
        } else {


            // Create province
            new Province(newProvince).save(cb);


        }
    });

};

// We create a static method to search for provinces
// The search can be paged and ordered
provinceSchema.statics.getList = function (filters, limit, skip, sort, fields, includeTotal, cb) {

    const query = Province.find(filters);
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
        Province.count(filters, (err, total) => {
            if (err) return cb(err);
            result.total = total;
            return cb(null, result);
        });
    });
}

var Province = mongoose.model('Province', provinceSchema);

module.exports = Province;

