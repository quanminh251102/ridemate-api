const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    creater: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    apply: { type: mongoose.Schema.Types.ObjectId, ref: "apply" },
    note: { type: String, default: "" },
    star: { type: Number, default: 0 },
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

module.exports = mongoose.model("review", reviewSchema);
