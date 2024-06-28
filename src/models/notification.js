const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        // notifcation is describe author's action, and sent to receiver
        text: {
          type: String,
          required: true,
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

module.exports = mongoose.model("notification", notificationSchema);
