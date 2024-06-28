const http = require("http");
const app = require("./src/app");
const server = http.createServer(app);

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

// server listening
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Connect socket (with cors, for web app)
var io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// module.exports = io
// require("./src/sockets/socket");
// require("./src/sockets/features/chat.feature");
// require("./src/controllers/message");

const { chat_feature_init } = require("./src/sockets/features/chat.feature.js");
const { calling_feature_init } = require("./src/sockets/features/calling.feature.js");
const UserData = require('./src/sockets/data/user.js');
const SocketIdData = require('./src/sockets/data/socket_id.data.js');
const { userConnected, userDisconnected } = require("./src/sockets/function/socket.function.js");

const jwt = require("jsonwebtoken");

const config = process.env;

io.on("connection", async (client) => {
    console.log(`Client connected!`);
    // init feature here
    chat_feature_init(client, io);
    calling_feature_init(client, io);
    const token = client.handshake.query.token;
    
    const decoded = jwt.verify(token, config.ACCESS_TOKEN_KEY);
    const userId = decoded.user_id; // req.user = { user_id: '',  role : '' }
    UserData.updateSocket(userId, client.id);
    SocketIdData.update(client.id, decoded.email);

    client.on("update", async (data) => {
      console.log(`Client update!`);
      const { user_id, socket_id, user_name  } = data; 
 
      
      UserData.updateName(user_id, user_name);
      UserDate.updateIsOnline(user_id, true);
      userConnected(user_id); 
    });

    client.on("disconnect", async (data) => {
       console.log(`Client disconnect!`);
      // const { user_id, socket_id, user_name  } = data;
      // UserData.updateSocket(user_id, '');
      // UserData.updateIsOnline(user_id, false);

      // await userDisconnected(user_id);
    });

    
    // when we get a call to start a call
    client.on('start-call', async ({ to, callerName, callerId, callerAvatar })=> {
     
      const socketId = await SocketIdData.get(to);
      console.log("initiating call request to ", to , ' ', socketId);
      io.to(socketId).emit("incoming-call", { 
        from: to, 'callerName' : callerName, 'callerId' : callerId,
        'callerAvatar' : callerAvatar,
      })
    })

    // when an incoming call is accepted
    client.on("accept-call", async ({ to })=> {
        const socketId = await SocketIdData.get(to);
        console.log("call accepted by ", " from ", to, ' ', socketId);

        io.to(socketId).emit("call-accepted", { to })
    })
    
    // when an incoming call is denied
    client.on("deny-call", async ({ to })=> {
        const socketId = await SocketIdData.get(to);
        console.log("call denied by "," from ", to, ' ', socketId);

        io.to(socketId).emit("call-denied", { to })
    })
    
    // when a party leaves the call
    client.on("leave-call",async  ({ to })=> {
        const socketId = await SocketIdData.get(to);
        console.log("left call mesg by  from ", to, ' ', socketId);
  
        io.to(socketId).emit("left-call", { to })
    })

    // when an incoming call is accepted,..
    // caller sends their webrtc offer
    client.on("offer", async ({ to, offer })=> {
        const socketId = await SocketIdData.get(to);
        console.log("offer from  to ", to, ' ', socketId);

        io.to(socketId).emit("offer", { to, offer })
    })

    // when an offer is received,..
    // receiver sends a webrtc offer-answer
    client.on("offer-answer",async  ({ to, answer })=> {
        const socketId = await SocketIdData.get(to);
        console.log("offer answer from  to ", to, ' ', socketId);
        io.to(socketId).emit("offer-answer", { to, answer })
    })
    

    // when an ice candidate is sent
    client.on("ice-candidate",async ({ to, candidate })=> {
        const socketId = await SocketIdData.get(to);
        console.log("ice candidate from to ", to, ' ', socketId);
   
        io.to(socketId).emit("ice-candidate", { to, candidate })
    })
});

// module.exports = io

exports.io = io;