const User = require("../../models/user");
const Message = require("../../models/message");
const ChatRoom = require("../../models/chat_room");
const UserData = require('../data/user');

const userConnected = async (uid = "", socket_id) => {
  const user = await User.findById(uid);
  user.online = true;
  user.time = new Date();
  user.isCalling = false;
  await user.save();
  return user;
};

const userDisconnected = async (uid = "") => {
  const user = await User.findById(uid);
  user.online = false;
  user.time = new Date();
  await user.save();
  return user;
};

const getUser = async (uid = "") => {
  const user = await User.findById(uid);
  return user;
};

const saveMessage = async (payload) => {
  try {
    const message = Message({
      chatRoomId: payload.chatRoomId,
      userId: payload.userId,
      message: payload.message,
      type: payload.type,
    });
    let newMessage = await message.save();
    console.log(newMessage);

    let chatRoom = await ChatRoom.findById(payload.chatRoomId);
    chatRoom.lastMessage = newMessage._id;
    await chatRoom.save();

    return true;
  } catch (error) {
    return false;
  }
};

const sendEvent = async (userId, eventName, data) => {
  try {
    // const io = require('../../../index.js');
    const {io} = require('../../../index.js');
    
    const receiver_socket_id = await UserData.getSocket(userId);
    console.log('socket id', userId, ' ',  receiver_socket_id);
    if (receiver_socket_id != null && receiver_socket_id != undefined){
        io.to(receiver_socket_id).emit(
          eventName, 
          data
        );
    }

  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  userConnected,
  userDisconnected,
  saveMessage,
  getUser,
  sendEvent,
};
