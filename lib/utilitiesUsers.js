'use strict';

const mongoose = require('mongoose');




function constructSearchFilter(req) {


    const queryText = req.query.queryText;
    const begin_date = req.query.begin_date;
    const end_date = req.query.end_date;
    const profile = req.query.profile;
    const city = req.query.city;

    let filter = {};
    let filterAND = {};
    let filterOR;

    if (queryText) {

        filterOR = {
            $or:
                [
                    { first_name: { $regex: new RegExp(queryText, "ig") } },
                    { last_name: { $regex: new RegExp(queryText, "ig") } },
                    { alias: { $regex: new RegExp(queryText, "ig") } },
                    { company_name: { $regex: new RegExp(queryText, "ig") } },
                    { email: { $regex: new RegExp(queryText, "ig") } },
                    { phone_number: { $regex: new RegExp(queryText, "ig") } },
                    { mobile_number: { $regex: new RegExp(queryText, "ig") } },
                    { address: { $regex: new RegExp(queryText, "ig") } },
                    //{ city: { $regex: new RegExp(queryText, "ig") } }
                ]
        };

        if (isNaN(queryText) && queryText.lenght === 5) {
            filterOR.push({ zip_code: { $regex: new RegExp(queryText, "ig") } })
        }

    };



    if (begin_date) {
        //format date YYYY-MM-DD
        const d = new Date(begin_date);
        const n = d.toISOString();
        filterAND.create_date = { $gte: n };
    };

    if (end_date) {
        //format date YYYY-MM-DD
        const d = new Date(end_date);
        const n = d.toISOString();
        filterAND.create_date = { $lte: n };
    };

    if (profile) {
        filterAND.profile = { $regex: new RegExp(profile, "ig") };
    }

    //if (city) {
    //    filterAND.city = { $regex: new RegExp(city, "ig") };
    //};

    if (filterOR) {
        filter = {
            '$and': [
                filterOR,
                filterAND
            ]
        };
    }
    else filter = filterAND;

    return filter;
}

module.exports = constructSearchFilter;