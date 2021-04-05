const fs = require("fs");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AggregationCursor } = require("mongoose");
const { AWSUpload } = require("../util/AWSUtil");

const getUsers = async (req, res, next) => {
  let allUsers;
  try {
    allUsers = await User.find({}, "-password"); //excludes password field from returned objects
  } catch (err) {
    return new new HttpError(
      "Feteching users failed. please try again later",
      404
    )();
  }

  res
    .status(200)
    .json({ users: allUsers.map((user) => user.toObject({ getters: true })) });
};

const SignUp = async (req, res, next) => {
  console.log(req.file);
  const errors = validationResult(req); //looks for error detection from check middle ware functions
  if (!errors.isEmpty()) {
    console.log(errors);

    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password } = req.body; //ideally this information was transmitted using https
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    const error = new HttpError("Sign up failed, please try again later.", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "could not create user, please try again.",
      500
    );
    return next(error);
  }

  AWSUpload(req);

  const createdUser = new User({
    name, //short for name: name
    email,
    image: `${process.env.S3_BUCKET_PATH}${req.file.filename}`,
    password: hashedPassword, //passwords should be encrypted, never stored as plain text in data base
    places: [],
  });
  //console.log(createdUser);
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Failed to sign up, please try again later.",
      500
    );
    return next(error);
  }
  //Generating a token for a new user:
  let token;
  try {
    //second argument is the private key string
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Failed to sign up, please try again later.",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ user: createdUser.id, email: createdUser.email, token: token }); //converting Mongoose object to standart javascript object
};

const LogIn = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    return next(
      new HttpError("Invalid credentials, could not log you in", 401)
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    return next(
      new HttpError("Invalid credentials, coold not log you in", 403)
    );
  }
  //Will Generate Token here as the user has succesfully logged in

  let token;
  try {
    //second argument is the private key string
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  }); //will be comparing on the routes
};

/*const AWSUpload = (req) => {
  const fileStream = fs.createReadStream(req.file.path);
  const params = {
    ACL: "public-read",
    Bucket: process.env.S3_BUCKET,
    Key: req.file.filename,
    Body: fileStream,
  };

  s3.upload(params, function (error, data) {
    console.log(error, data);
  });
};*/

exports.getUsers = getUsers;
exports.SignUp = SignUp;
exports.LogIn = LogIn;
