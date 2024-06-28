const Booking = require("../models/booking");
const User = require("../models/user.js");
const { sendSuccess, sendError, sendServerError} = require("../utils/client.js");
const dataName = "booking_saved";

exports.add = async (req, res, next) => {
    try {
      await Promise.all([
        Booking.updateOne({ _id: req.params.id }, {
          $inc: {savedNum : 1},
          $addToSet : {
            userFavorites: req.user.user_id,
          } 
        }),
        User.findByIdAndUpdate(req.user.user_id, {
          booking : req.params.id
        })
      ])
     
      
      return sendSuccess(res, `Add 1 ${dataName} successfully`);
    } catch (e) {
      console.log(e);
      return sendServerError(res);
    }
  };

  exports.delete = async (req, res, next) => {
  try {
    await Booking.updateOne({ _id: req.params.id }, {
      $pull : {
        userFavorites: req.user.user_id,
      } 
    })
    return sendSuccess(res, `Delete 1 ${dataName} successfully`);
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};

