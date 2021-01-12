const express = require('express');     //you have to import express in every file
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post('/signup',
 [
     check('name').not().isEmpty(),
     check('email').normalizeEmail().isEmail(),
     check('password').isLength( {min : 6})
 ]
, usersController.SignUp);

router.post('/login', usersController.LogIn);


module.exports = router;