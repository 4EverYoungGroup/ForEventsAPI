const express = require('express');

module.exports = function (app) {
    app.use('/', require('../routes/index'));
    app.use('/apiv1/users', require('../routes/apiv1/users'));
    app.use('/apiv1/events', require('../routes/apiv1/events'));
    app.use('/apiv1/medias', require('../routes/apiv1/medias'));
    app.use('/apiv1/cities', require('../routes/apiv1/cities'));
    app.use('/apiv1/eventTypes', require('../routes/apiv1/eventTypes'));
}