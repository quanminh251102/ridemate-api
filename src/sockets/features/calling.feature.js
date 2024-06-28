const UserData = require('../data/user.js');
const SocketIdData = require('../data/socket_id.data.js');
const { CALL_TYPE } = require('../../contrants.js');

exports.calling_feature_init = async (client) => {
  client.on("stop_call", async (data) => {
    try {
      const current_user_id = await SocketIdData.get(client.id);
      console.log("stop_call => ", data["receiver_id"]);
      let caller_id = current_user_id;
      let receiver_id = data["receiver_id"];

      const caller = await User.findById(caller_id, {isCalling : 1, online: 1, _id : 1, name : 1, avatarUrl: 1});
      const receiver = await User.findById(receiver_id, {isCalling : 1, online: 1, _id : 1, name : 1, avatarUrl: 1});

      caller.isCalling = false;
    
      await caller.save();
      receiver.isCalling = false;

      await receiver.save();

      const receiver_socket_id = await UserData.get(receiver_id).socket_id;
      client.to(receiver_socket_id).emit("stop_call");
    } catch (error) {}
  });

  client.on("make_call", async (data) => {
    const current_user_id = await SocketIdData.get(client.id);
    console.log("caller_id : ", current_user_id);
    console.log(data);
    try {
      let caller_id = current_user_id;
      let receiver_id = data["receiver_id"];
      let call_type = data["call_type"];

      const caller = await User.findById(caller_id, {
        isCalling : 1, online: 1, _id : 1, first_name : 1, avatarUrl: 1});
      const receiver = await User.findById(receiver_id, {
        isCalling : 1, online: 1, _id : 1, first_name : 1, avatarUrl: 1});
      console.log(caller);
      console.log(receiver);

      if (receiver.isCalling == true || receiver.online == false) {
        console.log("busy");
        //client.to("private"+caller_id).emit("receiver_busy");
        client.emit("receiver_busy", {
          isCaller: true,
          partner: receiver,
          call_type: call_type,
        });
      } else {
        console.log("prepare for calling...");
        caller.isCalling = true;
        await caller.save();
        receiver.isCalling = true;
        await receiver.save();

        // client.to("private"+caller_id).emit("open_calling_ui",
        //     {
        //         'isCaller': true,
        //     },
        // );

        client.emit("open_calling_ui", {
          isCaller: true,
          partner: receiver,
          call_type: call_type,
        });

        const receiver_socket_id = await UserData.get(receiver_id).socket_id;
        client.to(receiver_socket_id).emit("open_calling_ui", {
          isCaller: false,
          partner: caller,
          call_type: call_type,
        });

        let partner_socket_id = await UserData.get(receiver_id).socket_id;

        let _str;
        if (call_type == CALL_TYPE.AUDIO) {
          _str = " đang gọi thường đến bạn"
        }
        else {
          _str = " đang gọi video đến bạn"
        }
        client.to(partner_socket_id).emit("receive_notification", {
          notification_body: receiver.name + _str,
          notification_name_screen: "meeting_screen",
        });
      }
    } catch (error) {}
  });

  client.on("meeting_agree", async (data) => {
    try {
      let partner_id = data["partner_user_id"];

      client.emit("meeting_refresh_media");
      const partner_socket_id = await UserData.get(partner_id).socket_id;
      client.to(partner_socket_id).emit("meeting_refresh_media");
    } catch (error) {}
  });

  client.on("send_server_cam_click", async (data) => {
    try {
      let partner_id = data["partner_user_id"];
      const partner_socket_id = await UserData.get(partner_id).socket_id;
      client.to(partner_socket_id).emit("server_send_partner_isVideo");
    } catch (error) {}
  });

  client.on("send_roomId", async (data) => {
    try {
      let partner_id = data["partner_user_id"];
      const partner_socket_id = await UserData.get(partner_id).socket_id;
      client.to(partner_socket_id).emit("recive_roomId", data);
    } catch (error) {}
  });
  
};
