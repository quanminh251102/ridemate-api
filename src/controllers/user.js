const User = require("../models/user");
const Review = require("../models/user");
const Apply = require("../models/apply");
const Booking = require("../models/booking");
const { sendSuccess, sendError, sendServerError} = require("../utils/client.js");
const dataName = "user";
const mongoose = require("mongoose");

exports.getOne = async (req, res, next) => {
  try {
    let data = await User.findById(req.params.id)


    let reviewNum = 0, applyNum = 0, bookingNum = 0;
    await Promise.all([
      Review.find({'receiver' : new mongoose.Types.ObjectId(req.params.id)})
      .then((value) => { 
      
        if (value.length > 0) {
          let res = 0;
          for (let i = 0 ; i < value.length ; i++){
            res = res + value[i].star;
          }
          reviewNum = res / value.length;
        }

      }),
      Apply.find({'applyer' : new mongoose.Types.ObjectId(req.params.id)})
      .then((value) => { applyNum = value.length;}),
      Booking.find({'authorId' : new mongoose.Types.ObjectId(req.params.id)})
      .then((value) => { bookingNum = value.length;}),
    ]);
    let user = data._doc;
    user.id = user._id;
    delete user._id;
    delete user.__v;
    return sendSuccess(res, `Get 1 ${dataName} successfully`, {
        ...user,
        reviewNum,
applyNum,
bookingNum,
    });
  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await User.findByIdAndUpdate(req.params.id, req.body, {new : true})
    return sendSuccess(res, `Update 1 ${dataName} successfully`, data);
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};

exports.getInfo = async (req, res, next) => {
  try {
    let data = await User.findById(req.user.user_id)
    
    return sendSuccess(res, `Get 1 ${dataName} successfully`, data);
  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};

exports.updateInfo = async (req, res, next) => {
  try {
    const data = await User.findByIdAndUpdate(req.user.user_id, req.body, {new : true})
 
    return sendSuccess(res, `Update 1 ${dataName} successfully`, data);
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};

