'use strict';

let mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

// Defining producer schema - similar as EF code first for db entry
let birdSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    latinName: {
        type: String,
        required: true,
        unique: true
    },
    descr: {
        type: String,
        required: true
    },
    lastObservedAt: {
        type: Date,
        required: true
    },
    picture: {
        type: String
    },
    // required: true
    coordinates: [{
        latitude: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        }
    }],
    authorName: {
        type: String
    }
});

mongoose.model('Bird', birdSchema);
