const {io} = require('../../../index.js');
const Notification = require('../../models/notification.js');
const User = require('../../models/user.js');
const UserData = require('../data/user.js');
const SocketIdData = require('../data/socket_id.data.js');

exports.send = async (fromUserId, toUserId, text) => {
    try{
      let fromUser, toUser;
      await Promise.all([
        User.findById(fromUserId).then((value) => {
            fromUser = value;
        }),
        User.findById(toUserId).then((value) => {
            toUser = value;
        }),
        Notification.create({
            receiver: toUserId,
            author: fromUserId,
            text: text,
        })   
      ]);

      let client_socket_id = await UserData.get(toUserId).socket_id;

      io.to(client_socket_id).emit("receive_notification", {
        notification_body: fromUser.first_name + ' ' + text,
        notification_name_screen: "notification",
      });
    }
    catch (e) {
      console.log(e);
    }
};
