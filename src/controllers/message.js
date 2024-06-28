const Message = require("../models/message");
const ChatRoom = require("../models/chat_room");
const { sendSuccess, sendError, sendServerError} = require("../utils/client.js");
const dataName = "message";
const mongoose = require("mongoose");
const chatFeature = require("../sockets/features/chat.feature.js");
exports.create = async (req, res, next) => {
  try {
    let data = new Message({
      chatRoomId: new mongoose.Types.ObjectId(req.body.chatRoomId),
      userId: new mongoose.Types.ObjectId(req.user.user_id),
      message : req.body.message,
      type : req.body.type,
    });

    await data.save();
    console.log(data);
    let message;
    await Promise.all([
      Message.find({_id : data._id}).populate("userId").then((value) => {
        message = value;
      }),
      ChatRoom.findByIdAndUpdate(req.body.chatRoomId, {
        lastMessage: new mongoose.Types.ObjectId(data._id)
      })
    ]);
    
    chatFeature.sendMessage(message[0]);

    return sendSuccess(res, `${dataName} added succesfully`, message[0]);

  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
};

exports.update = async (req, res, next) => {
  try {
    let id = req.params.id;

    const data = await Message.findByIdAndUpdate(id, req.body, { new : true})

    return sendSuccess(res, `Update 1 ${dataName} successfully`, data);
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};

exports.getList = async (req, res, next) => {
  try {
    let filter = {};
    let {page, pageSize, sortCreatedAt, sortUpdatedAt, chat_room_id} = req.query;
    let skipNum = 0;
    let userId = req.user.user_id;

    if (page) page = Number(page);
    else page = 1

    if (pageSize) pageSize = Number(pageSize);
    else pageSize = 20;

    skipNum = (page - 1) * pageSize;
    if (skipNum < 0) skipNum = 0;

    if (chat_room_id) filter.chatRoomId = new mongoose.Types.ObjectId(chat_room_id);

    let _sort = {};
    if (sortCreatedAt) _sort.createdAt = Number(sortCreatedAt);
    if (sortUpdatedAt) _sort.updatedAt = Number(sortUpdatedAt);

    let datas;
    await  Promise.all([
      Message
        .find(filter)
        .sort(_sort)
        .skip(skipNum)
        .limit(pageSize)
        .populate("userId").then((value) => {
          datas = value;
      }),
    ]);

    const chatRoom = await ChatRoom.findById(chat_room_id);

    if (chatRoom.userId1.toString() == userId){
      chatRoom.numUnwatched1 = 0;
    }
    else {
      chatRoom.numUnwatched2 = 0;
    }

    await chatRoom.save();
    
    return sendSuccess(res,`Get ${dataName} succesfully`, datas, datas.length);

  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};
