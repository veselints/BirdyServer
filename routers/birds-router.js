'use strict';

let express = require('express'),
    birdsController = require('../controllers/birds-controller');

// Defining producers router
let router = express.Router();

router.get('/', birdsController.getAll)
    .get('/coordinates/:id', birdsController.getCoordinatesById)
    .get('/:id', birdsController.getById)
    .post('/', birdsController.create)
    .put('/coordinates/:id', birdsController.addCoordinates)
    .put('/picture/:id', birdsController.changePicture);

module.exports = function(app) {
    app.use('/api/birds', router);
};
