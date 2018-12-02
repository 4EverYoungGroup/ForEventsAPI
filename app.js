'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

/* jshint ignore:start */
const db = require('./lib/connectMongoose');
/* jshint ignore:end */

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



require("./startup/models")();
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/validation")();

// error handlers

//development error handler
//will print stacktrace
if (app.get('env') === 'development') {
    /*jshint unused: false*/
    app.use(function (err, req, res, next) {
        if (err.status && err.status >= 500) console.error(err);
        res.status(err.status || err.code || 500);
        if (isAPI(req)) { // llamada de API, devuelvo JSON
            return res.json({
                ok: false,
                error: { code: err.code || err.status || 500, message: err.message, err: err }
            });
        }

        res.render('error', { message: err.message, error: err });
    });
    /*jshint unused: true*/
}

// production error handler
// no stacktraces leaked to user
/*jshint unused: false*/
app.use(function (err, req, res, next) {
    if (err.status && err.status >= 500) console.error(err);
    res.status(err.status || err.code || 500);
    if (isAPI(req)) { // API call? return JSON
        return res.json({
            ok: false,
            error: { message: err.message, err: {} }
        });
    }

    res.render('error', { message: err.message, error: {} });
});
/*jshint unused: true*/

function isAPI(req) {
    return req.originalUrl.indexOf('/api') === 0;
}

module.exports = app;
