// import environment letiable
require("dotenv").config();

// import database
require("./config/database").connect();


const express = require("express");
const bodyParser = require("body-parser");

// import routes
const todoRoutes = require("./routes/todo.js");
const authRoutes = require("./routes/auth.js");
const uploadRoutes = require("./routes/upload.js");
const chatRoomRoutes = require("./routes/chat_room.js");
const messageRoutes = require("./routes/message.js");
const userRoutes = require("./routes/user.js");
const bookingRoutes = require("./routes/booking.js");
const applyRoutes = require("./routes/apply.js");
const reviewRoutes = require("./routes/review.js");
const notificationRoutes = require("./routes/notification.js");
const locationHistorySearchRoutes = require("./routes/location_history_search.js");
const locationSavedRoutes = require("./routes/location_saved.js");
const chatBotRoutes = require("./routes/chatbot.js");

const statisticsRoutes = require("./routes/statistics.js");
const morgan =  require("morgan");
const useragent =  require('express-useragent');
const requestIp =  require('request-ip')
const Log = require('./middleware/log.js');
const verifyToken = require('./middleware/auth.js');
const app = express();

// log api
app.use(morgan("dev"))
// log client infomation
app.use(useragent.express());
// log ip
app.use(requestIp.mw())
app.use(Log);

// import swagger
const swaggerUi = require('swagger-ui-express');
const fs = require("fs");

const YAML = require('yaml')
const file  = fs.readFileSync( process.cwd() + '/src/swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customCssUrl: CSS_URL }));

const cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api/todos", todoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat_room", verifyToken, chatRoomRoutes);
app.use("/api/message", verifyToken, messageRoutes);
app.use("/api/user", verifyToken, userRoutes);
app.use("/api/booking", verifyToken, bookingRoutes);
app.use("/api/apply", verifyToken, applyRoutes);
app.use("/api/review", verifyToken, reviewRoutes);
app.use("/api/notification", verifyToken, notificationRoutes);
app.use("/api/location-history-search", verifyToken, locationHistorySearchRoutes);
app.use("/api/location-saved", verifyToken, locationSavedRoutes);
app.use("/api/statistics", verifyToken, statisticsRoutes);
app.use("/api/chatbot", verifyToken, chatBotRoutes);


module.exports = app;
