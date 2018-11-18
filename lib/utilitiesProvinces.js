'use strict';

const mongoose = require('mongoose');


function constructSearchFilter(req) {


    const name = req.query.name;

    let filter = {};


    if (name) {
        filter.name = { $regex: new RegExp(name, "ig") };
    }

    return filter;
}

module.exports = constructSearchFilter;