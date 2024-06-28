let socketIds = {};
// {
//     'email' : 'socket'
// }

exports.get = async (socket_id = "") => {
  return socketIds[socket_id];
};

exports.update = async (socket_id, email) => {
  try {
    socketIds[email] = socket_id;
    console.log('Socket data : ',socketIds);
  } catch (error) {
    console.log("updateSocketId error");
    console.log(error);
  }
};

