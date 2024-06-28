
const chat_room = require('../../models/chat_room');
const UserData = require('../data/user');
const Notification = require('../../models/notification');
const mongoose = require("mongoose");

exports.chat_feature_init = (client) => {

  client.on("join_chat_room", (data) => {
    try {
      console.log("join chat room ", data["chat_room_id"]);
      let chat_room_id = data["chat_room_id"];
      client.join(chat_room_id);
    } catch (error) {
      console.log(error);
    }
  });

  client.on("leave_chat_room", (data) => {
    try {
      console.log("leave chat room ,",data["chat_room_id"]);
      let chat_room_id = data["chat_room_id"];
      client.leave(chat_room_id);
    } catch (error) {
      console.log(error);
    }
  });
};

exports.sendMessage = async (message) => { 
  try {
    const {io} = require('../../../index.js');
    // const io = require('../../../index.js');
    //  console.log('2',io);

    // console.log(message);
    console.log(io.sockets.adapter.rooms);
    
    //  let sockets = await io.in(message["chatRoomId"]).fetchSockets();
   let usersInRoom = io.sockets.adapter.rooms.get(message["chatRoomId"].toString()).size;
    // let usersInRoom = sockets.size;
    // console.log(sockets);
    if (usersInRoom == 1) {   
      const chatRoom = await chat_room.findById(message["chatRoomId"]);
      let receiver_id;
      if (chatRoom.userId1 == message.userId.id) {
        receiver_id = chatRoom.userId2;
        chatRoom.numUnwatched2++;
      }
      else {
        receiver_id = chatRoom.userId1;
        chatRoom.numUnwatched1++;
      }
      await chatRoom.save();
   
      const receiver_socket_id = await UserData.getSocket(receiver_id);

      console.log(receiver_id, ' ', receiver_socket_id);
      if (receiver_socket_id != null && receiver_socket_id != undefined){
              // const _name = await UserData.get(message.userId).name;

        await Notification.create({
          receiver: new mongoose.Types.ObjectId(receiver_id),
          author: new mongoose.Types.ObjectId(message.userId.id),
          text: "Đã gửi 1 tin nhắn mới",
        });

        console.log('send notification chat');
          io.to(receiver_socket_id).emit(
            "receive_notification", 
            {
              notification_body: "Đã nhận 1 tin nhắn mới",
              notification_name_screen: "chat_screen",
            }
          );

          io.to(receiver_socket_id).emit("reload_chat_room", {});
      }

    }
    const roomId = message["chatRoomId"];
    const receiver_socket_id = await UserData.getSocket(message["userId"]["id"]);
    // io.to(receiver_socket_id).emit(
    //   "receive_message",
    //   message
    // );
    io.in(roomId.toString()).emit(
      "receive_message",
      message
    );
  } catch (error) {
    console.log(error);
  }
}
