const mongoose = require("mongoose");
const userSchema = require("./user.js");
const { BOOKING_STATUS } = require("../contrants.js");
const Booking = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null,
  },
  status: {
    type: Number,
    default: BOOKING_STATUS.available,
    // available, complete
    // 2 1
  },
  price: {
    type: Number,
    default: null,
  },
  bookingType: {
    type: String,
    require: true,
  },
  time: {
    type: Date,
    require: true,
  },
  content: {
    type: String,
    default: ""
  },
  startPointLat: {
    type: Number,
    require: true,
  },
  startPointLong: {
    type: Number,
    require: true,
  },
  startPointId: {
    type: String,
    default: ""
  },
  startPointMainText: {
    type: String,
    require: true,
  },
  startPointAddress: {
    type: String,
    require: true,
  },
  endPointLat: {
    type: Number,
    require: true,
  },
  endPointLong: {
    type: Number,
    require: true,
  },
  endPointId: {
    type: String,
    default: ""
  },
  endPointMainText: {
    type: String,
    require: true,
  },
  endPointAddress: {
    type: String,
    require: true,
  },
  distance: {
    type: String,
    default: "",
  },
  duration: {
    type: String,
    default: ""
  },
  point: {
    type: Number,
  },
  // save user object id
  userFavorites : {
    type: [String], 
    unique: true,
    // index:true
  },
  //save user object id
  userMayFavorites : {
    type: [String],
    unique: true,
    // index:true
  },
  //save complete booking/ case base which use for calculate icv 
  caseBaseUsed : {
    type: [String],
    unique: true,
    // index:true
  },
  applyNum: {
    type: Number,
    default: 0,
  }, 
  watchedNum: {
    type: Number,
    default: 0,
  }, 
  savedNum: {
    type: Number,
    default: 0,
  },
  diftAtribute: {
    type: Number,
    default: 1,
  },
  interesestValue: {
    type: Number,
    default: 0,
  },
  interesestConfidenceValue: {
    type: Number,
    default: 0,
  },
},
{
  timestamps: true,
  toJSON: {
      transform: (doc, obj) => {
        obj.id = obj._id;
        delete obj.__v;
        delete obj._id;
        return obj;
    }
  }
}
);

Booking.index({
  startPointMainText: 'text',
  startPointAddress: 'text',
  endPointMainText: 'text',
  endPointAddress: 'text',
  content: 'text',
})
module.exports = mongoose.model("booking", Booking);
