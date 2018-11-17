'use strict';

const mongoose = require('mongoose');
const config = require('config');
const db = mongoose.connection;

mongoose.Promise = global.Promise;

db.on('error', function (err) {
    console.error('mongodb connection error:', err);
    process.exit(1);
});

db.once('open', function () {
    console.info('Connected to mongodb.');
});

let options

if (process.env.NODE_ENV === 'production') {

    options = {
        useNewUrlParser: true,
        user: config.get('db.user'),
        pass: config.get('db.pass')
    }
}
else {
    options = {
        useNewUrlParser: true,
    }
}

mongoose.connect(config.get('db.address'), options);

module.exports = db;
