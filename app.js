'use strict';

// Requesting needed node modules
let express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

// Connecting to local mongodb
// let connectionString = 'mongodb://127.0.0.1:27017/thestyle';
let connectionString = process.env.MONGOLAB_URI;
mongoose.connect(connectionString);

// Setting up the server
let app = express();

// let port = 7777;
let port = process.env.PORT;
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Point the server to the router we have created
let birdsRouter = require('./routers/birds-router');
birdsRouter(app);

// Middleware to handle errors on the server
app.use(function(err, req, res, next) {
    if (err) {
        res.status(err.status || 500)
            .json({
                message: err.message
            });
        return;
    }
});

// Open the server connection
app.listen(port, function() {
    console.log(`Server running on port ${port}`);
});
