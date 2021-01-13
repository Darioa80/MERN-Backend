const { v4: uuidv4 } = require('uuid'); //use to generate unique id's for data
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');


const getPlaceByID = async (req,res, next) => {        //api/places/ :pid allows us to load places depending on place id
    const placeID = req.params.pid; 
    let place;

    try{
        place = await Place.findById(placeID);  //doesn't return a promise, can get from appending .exec()
    } catch(err){
        const error = new HttpError('Something went wrong, could not find a place', 500);   //error for request
        return next(error);
    }

    if(!place){ //ID doesn't exist error
         const error = new HttpError('Could not find a place for the provided id.', 404);
         return next(error);
         //throw(new HttpError('Could not find a place for the provided place id.', 404));
    }
    res.json({place: place.toObject( {getters: true} )});   //getters:true gets rid of id underscore (data base has "_id: " instead of "id") => returns id as string and adds to property
}                                                              //to Object works as this is an array

const getPlacesByUserID = async (req, res, next) => {

    const userID = req.params.uid;
    let userPlaces;
    try{
       // places = await Place.find({creator: userID});   //returns an Array with Mongoose
       userPlaces = await User.findById(userID).populate('places');
    } catch(err){
        const error = new HttpError('Feteching places failed, please try again later.', 500);
        return next(error);
    }


    if(userPlaces.length === 0 || !userPlaces){
       return next(new HttpError('Could not find places for the provided user id.', 404));
    }

    res.json( {places: userPlaces.map(place => place.toObject({ getters: true})) });

}

const createPlace = async (req,res,next) =>{  //data in the body of the POST request - encode data in the request
    const errors = validationResult(req);      //looks for error detection from check middle ware functions
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));    //need to use next due to async
    }
    const { title, description, address, creator } = req.body;
    console.log(address);

    let coordinates;
    try{
        coordinates = await getCoordsForAddress(address);   //function imported from location.js from utility that uses Google API
    } catch (error){
        return next(error); //quits the function
    }
    const createdPlace = new Place({        //constructed as a mongoose model
        title,
        description,
        address,
        location: coordinates,
        image: 'https://s.videogamer.com/meta/b411/cc5dc1cc-d9f5-4638-a42b-b6637be1cba8_Luigis_Mansion_3.jpg',
        creator
        //id: uuidv4(),
    });

    let user;
    try{
        user =  await User.findById(creator);
        
    } catch(err){
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }

    if(!user){
        return next(new HttpError('Could not find user for provided ID', 404));
    }
    console.log(user);

    
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();    //If we don't have an existing collection, this won't work. 
        await createdPlace.save( {session: sess} );
        user.places.push(createdPlace); //Allows Mongoose to establish the connection between the two models, only adds the id
        await user.save( {session: sess} );
        await sess.commitTransaction(); //changes will only occur if both tasks are successful
    }
    catch (err){
        const error = new HttpError('Creating place failed, please try again 2.', 500);
        return next(error);
    }

    res.status(201).json({place: createdPlace});
};

const updatePlaceByID = async (req,res,next) => {
    const errors = validationResult(req);      //looks for error detection from check middle ware functions
    console.log(errors);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
   
    const placeID = req.params.pid;  //id is in the url
    const { title, description } = req.body;    //in Patch requests, data is expected to be in the body

    let place; 

    try{
        place = await Place.findById(placeID);
    } catch(err){
        const error = new HttpError('Something went wrong', 500);
        return next(error);
    }

    place.title = title;
    place.description = description
    try{
        await place.save();
    } catch(err){
        const error = new HttpError('Something went wrong, could not update place', 500);
        return next(error);
    }
    
    res.status(200).json({place: place.toObject({getters: true})});
     
};

const deletePlaceByID = async (req,res,next) => {
    const placeID = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeID).populate('creator');//allows us to work with a document on another collection, returns the both Place and User documents
        console.log(place);
    } catch(err){
        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }

    if(!place){
        return next(new HttpError('Could not find place for this id.', 404));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
    } catch(err){
        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }
  

    res.status(200).json({message: 'Deleted place.'});
}

exports.getPlaceByID = getPlaceByID;    //don't execute the function, point to it
exports.getPlacesByUserID = getPlacesByUserID;
exports.createPlace = createPlace;
exports.updatePlaceByID = updatePlaceByID;
exports.deletePlaceByID = deletePlaceByID;