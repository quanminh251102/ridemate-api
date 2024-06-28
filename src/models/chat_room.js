const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
  userId1: { type: mongoose.Schema.Types.ObjectId, required: true },
  user1: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  userId2: { type: mongoose.Schema.Types.ObjectId, required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  numUnwatched1: {
    type: Number,
    default: 0,
  },
  numUnwatched2: {
    type: Number,
    default: 0,
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "message",
  },
},
{
  toJSON: {
      transform: (doc, obj) => {
        obj.id = obj._id;
        delete obj.__v;
        delete obj._id;
        return obj;
    }
  }
});


module.exports = mongoose.model("chat_room", chatRoomSchema);
