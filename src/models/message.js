const mongoose = require("mongoose");
const { MESSAGE_TYPE } = require("../contrants.js");

const messageSchema = new mongoose.Schema(
    {
        chatRoomId: { type: mongoose.Schema.Types.ObjectId, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "user" },
        message: { type: String, required: true },
        type: { type: String, required: true, enum: MESSAGE_TYPE },
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

module.exports = mongoose.model("message", messageSchema);