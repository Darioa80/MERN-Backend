const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true }, //this will be a url pointing towards a file (not stored in our database)
    address: {type: String, required : true },
    location: {
        lat : {type: Number, required: true},
        long : {type: Number, required: true}
    },
    creator: { type: String, required: true }
});

module.exports = mongoose.model('Place', placeSchema); //exporting this model => constructor function