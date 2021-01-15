
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user');


const getUsers = async (req, res, next) =>{
    let allUsers;
    try{
        allUsers = await User.find({},'-password'); //excludes password field from returned objects
    } catch(err){
        return new(new HttpError('Feteching users failed. please try again later', 404));
    }

    res.status(200).json({users: allUsers.map(user => user.toObject({getters:true}))});

}

const SignUp = async (req, res, next) => {
    const errors = validationResult(req);      //looks for error detection from check middle ware functions
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }
    const { name, email, password } = req.body;
    let existingUser;

    try{
        existingUser = await User.findOne({email: email});

    } catch(err){
        console.log(err);
        const error = new HttpError('Sign up failed, please try again later.', 500);
        return next(error);
    }
    
    if(existingUser){
        
        const error = new HttpError('User exists already, please login instead', 422);
        return next(error);
    }

    const createdUser = new User({
        name,       //short for name: name
        email,
        image: 'https://www.nintendonyc.com/_ui/img/carousel/hero-images/marioluigi2018.jpg',
        password,       //passwords should be encrypted
        places: []
    });

    try{
        await createdUser.save();
        console.log('hi');
    } catch(err){
        const error = new HttpError('Failed to sign up, please try again later.', 500)
        return next(error);
    }
    
    res.status(201).json({ user : createdUser.toObject({getters:true})});   //converting Mongoose object to standart javascript object

}

const LogIn = async (req,res,next) => {
    const { email, password } = req.body;

    let existingUser;

    try{
        existingUser = await User.findOne({email});
    } catch(err){
        const error = new HttpError('Logging in failed, please try again later.', 500)
        return next(error);
    }

    if(!existingUser || existingUser.password !== password){
        return next(new HttpError('Invalid credentials, cold not log you in', 401));
    }
    //connecting to the front end to update logIn state
    
    res.json({message: 'Logged In'});
}

exports.getUsers = getUsers;
exports.SignUp = SignUp;
exports.LogIn = LogIn;