const { v4: uuidv4 } = require('uuid'); //use to generate unique id's for data
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
    {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
        lat: 40.7484474,
        lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
    },
];

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
    let places;
    try{
        places = await Place.find({creator: userID});   //returns an Arra with Mongoose
    } catch(err){
        const error = new HttpError('Feteching places failed, please try again later.', 500);
        return next(error);
    }
    /*const places = DUMMY_PLACES.filter(u => { //filter returns an array
        return u.creator === userID ;
    });*/

    if(places.length === 0){
       return next(new HttpError('Could not find places for the provided user id.', 404));
    }

    res.json( places.map(place => place.toObject({ getters: true})) );

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

    try {
        await createdPlace.save();    //async task
    }
    catch (err){
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }

    res.status(201).json({place: createdPlace});
};

const updatePlaceByID = async (req,res,next) => {
    const errors = validationResult(req);      //looks for error detection from check middle ware functions
    console.log(errors);
    if(!errors.isEmpty()){
        throw new HttpError('Invalid inputs passed, please check your data.', 422);
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

const deletePlaceByID = (req,res,next) => {
    const placeId = req.params.pid;
    console.log(placeId);
    if(DUMMY_PLACES.find(p => p.id !== placeId)){
        throw new HttpError('Could not find a place for that ID.', 404);
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);  //creates a new array which excludes any objects that have placeId
    console.log(DUMMY_PLACES);
    res.status(200).json({message: 'Deleted place.'});
}

exports.getPlaceByID = getPlaceByID;    //don't execute the function, point to it
exports.getPlacesByUserID = getPlacesByUserID;
exports.createPlace = createPlace;
exports.updatePlaceByID = updatePlaceByID;
exports.deletePlaceByID = deletePlaceByID;