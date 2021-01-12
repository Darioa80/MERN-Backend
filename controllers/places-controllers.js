const { v4: uuidv4 } = require('uuid'); //use to generate unique id's for data
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

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

const getPlaceByID = (req,res, next) => {        //api/places/ :pid allows us to load places depending on place id
    const placeID = req.params.pid; 
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeID;
    });

    if(!place){
         throw(new HttpError('Could not find a place for the provided place id.', 404));
    }
        res.json({place: place});
}

const getPlacesByUserID = (req, res, next) => {

    const userID = req.params.uid;
    const places = DUMMY_PLACES.filter(u => { //filter returns an array
        return u.creator === userID ;
    });

    if(places.length === 0){
       return next(new HttpError('Could not find places for the provided user id.', 404));
    }

    res.json( {places} );

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
        coordinates = await getCoordsForAddress(address);
    } catch (error){
        return next(error); //quits the function
    }
    const createdPlace = {
        id: uuidv4(),
        title: title,
        description: description,
        location: coordinates,
        address: address,
        creator: creator
    }

    DUMMY_PLACES.push(createdPlace);
    res.status(201).json({place: createdPlace});
};

const updatePlaceByID = (req,res,next) => {
    const errors = validationResult(req);      //looks for error detection from check middle ware functions
    console.log(errors);
    if(!errors.isEmpty()){
        throw new HttpError('Invalid inputs passed, please check your data.', 422);
    }
   
    const placeId = req.params.pid;  //id is in the url
    const { title, description } = req.body;    //in Patch requests, data is expected to be in the body

    const updatedPlace= {...DUMMY_PLACES.find(current => current.id === placeId)}; //this creates a copy of the object
    const placeIndex = DUMMY_PLACES.findIndex(current => current.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description; 
    
    DUMMY_PLACES[placeIndex] = updatedPlace;    //the copy is used to update the actual array
    
    res.status(200).json({"Updated Object" : updatedPlace});
     
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