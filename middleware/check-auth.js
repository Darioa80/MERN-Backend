const jwt = require('jsonwebtoken');
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS'){   //adjustment to enseure options requests (sent by the browser) are not blocked
        return next();
    }
    try{
    const token = req.headers.authorization.split(' ')[1];   //look at app.js for expected headers => Authorization: 'Bearer TOKEN'
    if(!token){
        throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, 'supersecret_dont_share');
    req.userData = { userId: decodedToken.userId};       //can always add data to request object
    next();
    }catch(err){
        const error = new HttpError('Autnentication failed!', 403);
        return(next(error));
    }

        
}