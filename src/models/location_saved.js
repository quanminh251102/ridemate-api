const mongoose = require("mongoose");
const { LOCATION_TYPE } = require("../contrants.js");

const location_savedSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    type:  { type: String , enum :  LOCATION_TYPE},
    placeName:  { type: String , default: null},
    placeDescription: { type: String , default: null},
    placeId:  { type: String, default: null },
    placeGeoCode: { type: String , default: null},
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

module.exports = mongoose.model("location_saved", location_savedSchema);
