const mongoose = require("mongoose");

const location_history_searchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    placeName:  { type: String , default: null},
    placeDescription: { type: String , default: null },
    placeId:  { type: String , default: null},
    placeGeoCode: { type: String  , default: null},
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

module.exports = mongoose.model("location_history_search", location_history_searchSchema);
