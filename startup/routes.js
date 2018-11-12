const express = require('express');
const path = require('path');
module.exports = function (app) {

    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', require('../routes/index'));
    app.use('/apiv1/users', require('../routes/apiv1/users'));
    app.use('/apiv1/events', require('../routes/apiv1/events'));
    app.use('/apiv1/medias', require('../routes/apiv1/medias'));
    app.use('/apiv1/cities', require('../routes/apiv1/cities'));
    app.use('/apiv1/eventTypes', require('../routes/apiv1/eventTypes'));

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
}