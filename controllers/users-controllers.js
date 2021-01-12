const { v4: uuidv4 } = require('uuid'); 
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');


let DUMMY_USERS = [{
    id: 'u1',
    name: 'Dario Andrade Mendoza', 
    email: 'test@test.com',
    password: 'password',
    places : [{
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous sky scrapers in the world!',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u1'
    }]
}];

const getUsers = (req, res, next) =>{
    
    if(DUMMY_USERS.length === 0){
        throw(new HttpError('Could not find a place for the provided place id.', 404));
   }
    res.status(200).json(DUMMY_USERS);

}

const SignUp = (req, res, next) => {
    const errors = validationResult(req);      //looks for error detection from check middle ware functions
    if(!errors.isEmpty()){
        console.log(errors);
        throw new HttpError('Invalid inputs passed, please check your data.', 422);
    }
    const { name, email, password, places } = req.body;

    const hasUser = DUMMY_USERS.find(u => u.email === email);
    if(hasUser){
        throw new HttpError ('Could not create user, email arleady exists.', 422);

    }
    const createdUser = {
        id: uuidv4(),
        name,       //short for name: name
        email,
        password,
        places
    };
    DUMMY_USERS.push(createdUser);
    res.status(201).json({ user : createdUser})

}

const LogIn = (req,res,next) => {
    const { email, password } = req.body;
    const identifiedUser = DUMMY_USERS.find(currUser => currUser.email === email);
    console.log(identifiedUser);
    if(!identifiedUser || identifiedUser.password !== password){
        throw new HttpError('could not identify user, credentials seem to be wrong', 401);
    }
    
    res.json({message: 'Logged In'});
}

exports.getUsers = getUsers;
exports.SignUp = SignUp;
exports.LogIn = LogIn;