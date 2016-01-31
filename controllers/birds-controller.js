'use strict';

let mongoose = require('mongoose'),
    fs = require('fs');

require('../models/bird-model');
let Bird = mongoose.model('Bird');

let getCount = function(req, res, next) {
    Bird.count({}, function(err, count) {
        if (err) {
            next(err);
            return;
        }
        res.status(200);
        res.json(count);
    });
};

let getAll = function(req, res, next) {
    Bird.find({}, function(err, birds) {
        if (err) {
            next(err);
            return;
        }
        res.status(200);
        res.json(birds);
    });
};

let getById = function(req, res, next) {
    let currentId = req.params.id;

    Bird.findOne({
        '_id': currentId
    }, function(err, bird) {
        if (err) {
            next(err);
            return;
        } else if (bird === null) {
            next({
                message: "Birdy not found!",
                status: 404
            });
            return;
        }
        res.status(200);
        res.json(bird);
    });
};

let getCoordinatesById = function(req, res, next) {
    let currentId = req.params.id;

    Bird.findOne({
            "_id": currentId
        })
        .select({
            coordinates: 1
        })
        .exec(function(err, bird) {
            if (err) {
                next(err);
                return;
            } else if (bird === null) {
                next({
                    message: "Birdy coordinates not found!",
                    status: 404
                });
                return;
            }
            res.status(200);
            res.json(bird.coordinates);
        });
};

let create = function(req, res, next) {
    var newBird = new Bird(req.body);
    newBird.lastObservedAt = Date.now();

    var imgPath = './img/logo.png';
    var bitmap = fs.readFileSync(imgPath);
    var imageBufer = new Buffer(bitmap).toString('base64');
    newBird.picture = imageBufer;

    newBird.save(function(err) {
        if (err) {
            let error = {
                message: err.message,
                status: 400
            };
            next(error);
            return;
        } else {
            res.status(201);
            res.json(newBird);
        }
    });
};

let addCoordinates = function(req, res, next) {
    let currentId = req.params.id;
    let coordinates = req.body;

    Bird.findOne({
        "_id": currentId
    }, function(err, dbBird) {
        if (err) {
            next(err);
            return;
        } else if (dbBird === null) {
            next({
                message: "Birdy not found!",
                status: 404
            });
            return;
        }

        dbBird.coordinates.push(coordinates);
        dbBird.lastObservedAt = Date.now();

        dbBird.save(function(err) {
            if (err) {
                let error = {
                    message: err.message,
                    status: 400
                };
                next(error);
                return;
            } else {
                res.status(200);
                res.json(dbBird);
            }
        });
    });
};

let changePicture = function(req, res, next) {
    let currentId = req.params.id;
    // let picture = req.body;

    Bird.findOne({
        "_id": currentId
    }, function(err, dbBird) {
        if (err) {
            next(err);
            return;
        } else if (dbBird === null) {
            next({
                message: "Birdy not found!",
                status: 404
            });
            return;
        }

        var imgPath = './img/logo.png';
        var bitmap = fs.readFileSync(imgPath);
        var imageBufer = new Buffer(bitmap).toString('base64');
        dbBird.picture = imageBufer;

        dbBird.save(function(err) {
            if (err) {
                let error = {
                    message: err.message,
                    status: 400
                };
                next(error);
                return;
            } else {
                res.status(200);
                res.json(dbBird);
            }
        });
    });
};

let controller = {
    getCount,
    getAll,
    getById,
    getCoordinatesById,
    create,
    addCoordinates,
    changePicture
};

module.exports = controller;