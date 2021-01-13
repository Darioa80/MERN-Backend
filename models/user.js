const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, require: true},
    email: {type: String, require: true, unique: true}, //creates index, which speeds up searching and quering
    password : {type: String, require: true, minLenth: 6},
    image: {type: String, require: true},
    places: [{ type: mongoose.Types.ObjectId, required : true, ref: 'Place' }] //connects to Place Schema

});

userSchema.plugin(uniqueValidator); //amkes sure we have only one user with one email

module.exports = mongoose.model('User', userSchema);    //first string defines the name of the collection