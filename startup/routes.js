// const express = require('express');
// const path = require('path');
module.exports = function (app) {

    app.use('/', require('../routes/index'));
    app.use('/apiv1/users', require('../routes/apiv1/users'));
    app.use('/apiv1/events', require('../routes/apiv1/events'));
    app.use('/apiv1/medias', require('../routes/apiv1/medias'));
    app.use('/apiv1/transactions', require('../routes/apiv1/transactions'));
    app.use('/apiv1/cities', require('../routes/apiv1/cities'));
    app.use('/apiv1/provinces', require('../routes/apiv1/provinces'));
    app.use('/apiv1/countries', require('../routes/apiv1/countries'));
    app.use('/apiv1/eventTypes', require('../routes/apiv1/eventTypes'));
    app.use('/apiv1/favoriteSearches', require('../routes/apiv1/favoriteSearches'));

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
}