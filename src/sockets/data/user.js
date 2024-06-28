let users = {};
// {
//     'userId' : {
//         'isOnline' : 'bool',
//         'name' : 'string',
//         'socket_id' : 'string',
//     }
// }

exports.get = async (uid = "") => {
  return socketIds[uid];
};

exports.getSocket = async (uid = "") => {
  try {
    return users[uid].socket_id;
  } catch (e) {
    return null;
  }
};


exports.updateSocket = async (uid = "", socket_id) => {
  try {
    if (users[uid] == null) {
      users[uid] = {};
    }
    users[uid].socket_id = socket_id;
    console.log(users)
  } catch (error) {
    console.log("user updateSocket error");
    console.log(error);
  }
};

exports.updateName = async (uid = "", name) => {
    try {
      users[uid].name = name;
    } catch (error) {
      console.log("user update name error");
      console.log(error);
    }
};

exports.updatIsOnline = async (uid = "", isOnline) => {
    try {
      users[uid].isOnline = isOnline;
    } catch (error) {
      console.log("user update isOnline error");
      console.log(error);
    }
};
