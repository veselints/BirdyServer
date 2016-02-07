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
    Bird.find({})
        .sort({
            'lastObservedAt': -1
        })
        //.limit(5)
        .exec(function(err, birds) {
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
    if (!currentId || currentId === "") {
        next({
            message: "Bad request!",
            status: 404
        });
        return;
    }

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
    if (!currentId || currentId === "") {
        next({
            message: "Bad request!",
            status: 404
        });
        return;
    }

    Bird.findOne({
            "_id": currentId
        })
        .select({
            coordinates: 1
        })
        .exec(function (err, bird) {
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

let getBirdsAfterDate = function(req, res, nex) {
    let currentDate = req.params.date;
    if (!currentDate || currentDate === "") {
        next({
            message: "Bad request!",
            status: 404
        });
        return;
    }

    let trueDateString = currentDate.replace(" ", "T");
    let resultDate = new Date(trueDateString);
    console.log(resultDate);

    if (isNaN(resultDate.getTime())) {
        next({
            message: "Bad request!",
            status: 404
        });
        return;
    }

    Bird.find({
        "createdOn": {
            "$gte": resultDate
        }
    })
    .exec(function (err, birds){
        if (err) {
            next(err);
            return;
        }

        Bird.find({
            "lastObservedAt": {
                "$gte": resultDate
            }, "createdOn": {
                "$lt": resultDate
            }
        })
        .select({
            coordinates: 1,
            _id: 1
        })
        .exec(function (err, birdsWithCoordinates) {
            if (err) {
                next(err);
                return;
            }

            let birdsNumber = birdsWithCoordinates.length;
            let resultsCoordinates = [];
            if (birdsNumber > 0) {
                for (let i = 0; i < birdsNumber; i++) {
                    let currentBird = birdsWithCoordinates[i];
                    let currentCoordinates = currentBird.coordinates;
                    let numberOfCoordinatesForCurrentBird = currentCoordinates.length;
                    for (let j= 0; j < numberOfCoordinatesForCurrentBird; j++) {
                        let coors = currentCoordinates[j];
                        if (coors.createdOn > resultDate) {
                            console.log(currentBird._id);
                            coors = {
                                birdyId: currentBird._id,
                                latitude: coors.latitude,
                                longitude: coors.longitude,
                                _id: coors._id
                            }
                            
                            resultsCoordinates.push(coors); 
                        }
                    };
                };
            }

            res.status(200);
            res.json({
                coordinates: resultsCoordinates,
                birds: birds
            });
        });
    });
};

let deleteByName = function(req, res, next) {
    let currentName = req.params.name;
    if (!currentName || currentName === "") {
        next({
            message: "Bad request!",
            status: 404
        });
        return;
    }

    Bird.remove({
        'name': currentName
    }, function(err) {
        if (err) {
            next(err);
            return;
        }
        res.status(200);
        res.json({
            currentName
        });
    });
};

let create = function(req, res, next) {
    var newBird = new Bird(req.body);
    newBird.lastObservedAt = Date.now();
    newBird.createdOn = Date.now();
    newBird.coordinates = [{
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        createdOn: Date.now()
    }];

    newBird.save(function(err) {
        if (err) {
            let error = {
                message: err.message,
                status: 400
            };
            next(err);
            return;
        } else {
            res.status(201);
            res.json(newBird);
        }
    });
};

let deleteAll = function(req, res, next) {
    Bird.remove({}, function(err) {
        if (err) {
            let error = {
                message: err.message,
                status: 400
            };
            next(err);
            return;
        } else {
            res.status(201);
            res.json({});
        }
    });
};

let bulckCreate = function(req, res, next) {
    let len = req.body.length;

    for (let i = 0; i < len; i++) {
        var newBird = new Bird(req.body[i]);
        var pictureNumber = (i + 1).toString();
        var imgPath = './img/' + pictureNumber + '.png';
        var bitmap = fs.readFileSync(imgPath);
        var imageBufer = new Buffer(bitmap).toString('base64');
        newBird.picture = imageBufer;

        newBird.save(function(err) {
            if (err) {
                let error = {
                    message: err.message,
                    status: 400
                };
                next(err);
                return;
            } else {

            }
        });

        console.log(i);
    };

    res.json({});
};

let addCoordinates = function(req, res, next) {
    let currentId = req.params.id;
    let coordinates = req.body;
    if (!currentId || currentId === "") {
        next({
            message: "Bad request!",
            status: 404
        });
        return;
    }
    if (!coordinates || coordinates === "" || !coordinates.latitude || !coordinates.longitude) {
        next({
            message: "Bad request!",
            status: 404
        });
        return;
    }

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

        dbBird.coordinates.push({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            createdOn: Date.now()
        });
        dbBird.lastObservedAt = Date.now();

        dbBird.save(function(err) {
            if (err) {
                next(error);
                return;
            } else {
                res.status(200);
                res.json(dbBird.coordinates);
            }
        });
    });
};

let changePicture = function(req, res, next) {
    let currentId = req.params.id;
    // let picture = req.body;
    if (!currentId || currentId === "") {
        next({
            message: "Bad request!",
            status: 404
        });
        return;
    }

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
    changePicture,
    deleteByName,
    bulckCreate,
    deleteAll,
    getBirdsAfterDate
};

module.exports = controller;
