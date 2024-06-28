const User = require("../../models/user");
const Booking = require("../../models/booking");
const Review = require("../../models/review");
const Notification = require("../../models/notification.js");
const Message = require("../../models/message.js");
const LocationSaved = require("../../models/location_saved.js");
const LocationHistorySearched = require("../../models/location_history_search");
const ChatRoom = require("../../models/chat_room");
const Apply = require("../../models/apply");

const { sendSuccess, sendError, sendServerError} = require("../../utils/client.js");
const dataName = "user";
const bcrypt = require("bcryptjs");

exports.create = async (req, res, next) => {
    // Our register logic starts here
    try {
      // Get user input
      const { name, email, password, date, age, gender, phoneNumber } = req.body;
      console.log(req.body);
      // Validate user input
      // if (!(email && password && name)) {
      //   return sendError(res, "Tất cả các thông tin đều bắt buộc.")
      // }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return sendError(res, "Email này đã có")
      }
      
      console.log(password);
      //Encrypt user password
      let encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await User.create({
        'firstName' : name,
        'email': email.toLowerCase(), // sanitize: convert email to lowercase
        'password': encryptedPassword,
        'birthDate': new Date(date),
        'gender': gender,
        'age': Number(age),
        'phoneNumber' : phoneNumber,
        // Add default avatar
        avatarUrl:
          "https://res.cloudinary.com/dxoblxypq/image/upload/v1679984586/9843c460ff72ee89d791bffe667e451c_rzalqh.jpg",
      });
  
      sendSuccess(res,"register successfully", user);
    } catch (err) {
      console.log(err);
      sendServerError(res);
    }
};

exports.getList = async (req, res, next) => {
    try {
      let filter = {};
      let {page, pageSize, sortCreatedAt, sortUpdatedAt, keyword} = req.query;
      let skipNum = 0;
  
      if (page) page = Number(page);
      else page = 1
  
      if (pageSize) pageSize = Number(pageSize);
      else pageSize = 20;
  
      skipNum = (page - 1) * pageSize;
      if (skipNum < 0) skipNum = 0;
  
      if (keyword) {
          filter = {
            $or: [
              {
                firstName : {$regex: keyword}
              },
              {
                lastName : {$regex: keyword}
              },
              {
                email : {$regex: keyword}
              }
            ]
          }
      }
  
      let _sort = {};
      if (sortCreatedAt) _sort.createdAt = Number(sortCreatedAt);
      if (sortUpdatedAt) _sort.updatedAt = Number(sortUpdatedAt);
  
      const datas = await User
      .find(filter)
      .sort(_sort)
      .skip(skipNum)
      .limit(pageSize)
      
      return sendSuccess(res,`Get ${dataName} succesfully`, datas, datas.length);
  
    } catch (e) {
      console.log(e);
      return sendServerError(res);
    }
};

exports.getOne = async (req, res) => {
  try {
    const {id} = req.params;
    const data = await User.findById(id)
    
    return sendSuccess(res, `Get 1 ${dataName} successfully`, data);
  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};

exports.update = async (req, res, next) => {
  try {
    console.log(req.body);
    if (req.body.date) req.body.birthDate = new Date(req.body.date);
    if (req.body.password != undefined && req.body.password != null) {
      let encryptedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = encryptedPassword;
    }
    const data = await User.findByIdAndUpdate(req.params.id, req.body, {new : true})
    return sendSuccess(res, `Update 1 ${dataName} successfully`, data);
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await User.findByIdAndRemove(req.params.id);

    const bookings = await Booking.find({'authorId' : req.params.id}).lean();
    const bookingIds = bookings.map((booking) => booking._id);
    console.log(bookingIds);

    await Promise.all([
      Review.deleteMany(
        { $or : [{"creater" : req.params.id},
        {"receiver" : req.params.id}, 
      ]}),
      Notification.deleteMany(
        { $or : [{"author" : req.params.id},
        {"receiver" : req.params.id}, 
      ]}),
      Message.deleteMany({"userId" : req.params.id}),
      LocationSaved.deleteMany({"user" : req.params.id},),
      LocationHistorySearched.deleteMany({"user" : req.params.id},),
      ChatRoom.deleteMany(
        { $or : [{"user1" : req.params.id},
        {"user2" : req.params.id}, 
      ]}),
      Apply.deleteMany({
        $or: [
          {'booking':{'$in':bookingIds}},
          { 'applyer' : req.params.id}
        ], 
      }),
      Booking.deleteMany({'_id':{'$in':bookingIds}}),
    ]);
 
    return sendSuccess(res, `Delete 1 ${dataName} successfully`, data);
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};