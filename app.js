const fs = require('fs'); //file system
const path = require('path'); //path module built into node
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');

const placesRoutes = require('./routes/places-routes'); //importing 
const usersRoutes = require('./routes/users-routes');
//usually want to change username, password and db name for when deploying the application

const url = 
//`mongodb+srv://DarioAM:JtpgLpnIQMUa09Sb@mern.pdpya.mongodb.net/mern?retryWrites=true&w=majority`
`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.pdpya.mongodb.net/mern?retryWrites=true&w=majority`
//process.env is provided by node, process is always avaiable
;
const app = express();

app.use(bodyParser.json()); //parse incoming request bodies and convert to JSON arrays and moves on to the next function

app.use('/uploads/images', express.static(path.join('uploads','images')))//middleware to reach images

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //opens up this domain to be access from other domains (CORS error)
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')//Which Http methods to be usedfrom the front end
    next();
})

app.use('/api/places/' , placesRoutes);  // => /api/places/...
app.use('/api/users/', usersRoutes);


app.use((req, res, next) => { //this only runs if we didn't send a response in a previous route
    const error = new HttpError('Could not find this route.', 404);
    return next(error);
});  

app.use((error, req, res, next) =>{     //recognize this as an error handlding middleware function and will only be executed
    if(req.file){       //middleware has detected an error, because we have a file in our request, we will now delete it
        fs.unlink(req.file.path, (err)=>{
            console.log(err);
        });
    }
    if(res.headerSent){     //check if a header has already been sent in other middleware function
        return next(error);
    }                                    //where errors are thrown in other middleware functions
    res.status(error.code || 500);
    res.json({message: error.message || "An unknown error ocurred"});
})

mongoose
    .connect(url)
    .then(() => {
        app.listen(process.env.PORT || 5000);
    })
    .catch((error) => {
        console.log(error);
    });

