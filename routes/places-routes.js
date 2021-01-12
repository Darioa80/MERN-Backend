const express = require('express');     //you have to import expressin every file
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');

const router = express.Router();



//The onle of routes matters
//if we go to the route '/user/ it will trigget the '/:pid' route as pid can be anything (user is interpretted as pid)
//if we had a '/user/ route, we had to place it before the '/:pid'

router.get('/:pid', placesControllers.getPlaceByID);

router.get('/user/:uid', placesControllers.getPlacesByUserID);

router.post('/', 
    [                   //array of middleware functions to check request data
    check('title')
    .not()
    .isEmpty(),
    check('description').isLength({min: 5}),
    check('address').not().isEmpty() 
    ],
    placesControllers.createPlace);    //not limited to one middleware function, executed lefto to right

router.patch('/:pid',
 [
     check('title').not().isEmpty(), 
     check('description').isLength({min: 5})
 ], placesControllers.updatePlaceByID);   //doesn't clash with other routes due to unique HTTP verb

router.delete('/:pid', placesControllers.deletePlaceByID);

//new route that accepts dynamic uid, extract the creator user id

module.exports = router;