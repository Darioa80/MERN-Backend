const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');

const placesRoutes = require('./routes/places-routes'); //importing 
const usersRoutes = require('./routes/users-routes');

const url = `mongodb+srv://DarioAM:JtpgLpnIQMUa09Sb@mern.pdpya.mongodb.net/places?retryWrites=true&w=majority
`;
const app = express();

app.use(bodyParser.json()); //parse incoming request bodies and convert to JSON arrays and moves on to the next function

app.use('/api/places/' , placesRoutes);  // => /api/places/...
app.use('/api/users/', usersRoutes);


app.use((req, res, next) => { //this only runs if we didn't send a response in a previous route
    const error = new HttpError('Could not find this route.', 404);
    return next(error);
});  

app.use((error, req, res, next) =>{     //recognize this as an error handlding middleware function and will only be executed
    if(res.headerSent){     //check if a header has already been sent in other middleware function
        return next(error);
    }                                    //where errors are thrown in other middleware functions
    res.status(error.code || 500);
    res.json({message: error.message || "An unknown error ocurred"});
})

mongoose
    .connect(url)
    .then(() => {
        app.listen(5000);
    })
    .catch((error) => {
        console.log(error);
    });

