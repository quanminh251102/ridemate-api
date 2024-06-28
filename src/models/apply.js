const mongoose = require("mongoose");
const { APPLY_STATE } = require("../contrants.js");

const applySchema = new mongoose.Schema(
  {
    applyer: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    dealPrice: { type: Number },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "booking" },
    note: { type: String },
    state: { type: String, enum : APPLY_STATE }, // waiting / accepted->starting->close / refuse
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

module.exports = mongoose.model("apply", applySchema);
