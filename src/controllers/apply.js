const mongoose = require("mongoose");
const Apply = require("../models/apply");
const Booking = require("../models/booking");
const Notification = require("../models/notification.js");
const User = require("../models/user.js");
const { sendSuccess, sendError, sendServerError} = require("../utils/client.js");
const dataName = "booking";
const { sendEvent } = require("../sockets/function/socket.function.js");
const { APPLY_STATE, BOOKING_STATUS } = require("../contrants.js");
const {saveNewCaseBase } = require("../service/recommed_system/recommend_system.js");

exports.create = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.body.booking);

    if (booking.authorId == req.user.user_id){
      return sendError(res, "Không thể tham gia vào chuyến đi của bạn, vui lòng chọn chuyến khác!");
    }
    
    const oldApply = await Apply.findOne({
      applyer: new mongoose.Types.ObjectId(req.user.user_id),
      booking: new mongoose.Types.ObjectId(req.body.booking),
      state: "waiting",
    });

    if (oldApply != null && oldApply != undefined) {
      return sendError(res, "Bạn đã gửi yêu cầu vào chuyến đi này rồi !");
    }

    let data = new Apply({
      applyer: new mongoose.Types.ObjectId(req.user.user_id),
      note: req.body.note,
      dealPrice: Number(req.body.dealPrice),
      booking: new mongoose.Types.ObjectId(req.body.booking),
      state: "waiting",
    });

    await data.save();
    await Promise.all([
      data.save(),
      User.findByIdAndUpdate(req.user.user_id, {
        booking : new mongoose.Types.ObjectId(req.body.booking),
      }),
      Booking.findByIdAndUpdate(req.body.booking, {
        $inc: {applyNum : 1},
      }),
    ]);

    data = await Apply
    .findById(data.id)
    .populate("applyer")
    .populate({
      path: "booking",
      populate: {
        path: "authorId",
      },
    });
    
    await Notification.create({
      'receiver' : new mongoose.Types.ObjectId(data.booking.authorId.id),
      'author' : new mongoose.Types.ObjectId(req.user.user_id),
      'text' : `${data.applyer.firstName} đã yêu cầu tham gia chuyến đi của bạn`,
    });
    
    
    // Send notification to applyer
    sendEvent(data.booking.authorId.id,"receive_notification",{
      notification_body: `${data.applyer.firstName} đã yêu cầu tham gia chuyến đi của bạn`,
      notification_name_screen: "chat_screen",
    });

    sendEvent(data.booking.authorId.id,"receive_apply",data);
    
    return sendSuccess(res, "Apply added succesfully", data);

  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
};

exports.update = async (req, res, next) => {
  try {
    // user call this api is the one who create booking
    let id = req.params.id;

    const data = await Apply.findByIdAndUpdate(id, req.body, {new : true})
    .populate("applyer")
    .populate({
      path: "booking",
      populate: {
        path: "authorId",
      },
    });

    if (req.body.state == "close") {
      await saveNewCaseBase(data.booking.id);
    }
    
    let text = data.booking.authorId.firstName;
    if (req.body.state == APPLY_STATE.ACCEPTED)
      text += " đã đồng ý yêu cầu tham gia chuyến đi của bạn";
    if (req.body.state == APPLY_STATE.STARTING)
      text += " đã bắt đầu chuyến đi";
    if (req.body.state == APPLY_STATE.CLOSE)
      text += " đã đóng chuyến đi";
    if (req.body.state == APPLY_STATE.REFUSE)
      text += " đã từ chối yêu cầu tham gia chuyến đi của bạn";

    await Notification.create({
      'receiver' : new mongoose.Types.ObjectId(data.applyer.id),
      'author' : new mongoose.Types.ObjectId(req.user.user_id),
      'text' : text,
    });

    // Send notification to applyer
    sendEvent(data.applyer.id.toString(),"receive_notification",{
      notification_body: text,
      notification_name_screen: "chat_screen",
    });

    // Send reload apply to applyer
    console.log(data.applyer.id.toString(),' ',req.user.user_id.toString());
    sendEvent(data.applyer.id.toString(),"reload_apply", {});

    sendEvent(req.user.user_id.toString(),"reload_apply", {});

    return sendSuccess(res, `Update 1 ${dataName} successfully`, data);
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};

exports.getList = async (req, res, next) => {
  try {
    let filter = {};
    let {page, pageSize, sortCreatedAt, sortUpdatedAt, applyerId, bookingId} = req.query;
    let skipNum = 0;

    if (page) page = Number(page);
    else page = 1

    if (pageSize) pageSize = Number(pageSize);
    else pageSize = 20;

    skipNum = (page - 1) * pageSize;
    if (skipNum < 0) skipNum = 0;

    if (applyerId != null && applyerId != undefined && applyerId != '')
       filter.applyer = new mongoose.Types.ObjectId(applyerId);

    if (bookingId != null && bookingId != undefined && bookingId != '') {
      filter.booking = new mongoose.Types.ObjectId(bookingId);
    }
    else {
      filter.applyer = new mongoose.Types.ObjectId(req.user.user_id);
    }

    let _sort = {};
    if (sortCreatedAt != null && sortCreatedAt != undefined && sortCreatedAt != '')
      _sort.createdAt = Number(sortCreatedAt);
    if (sortUpdatedAt != null && sortUpdatedAt != undefined && sortUpdatedAt != '')
      _sort.updatedAt = Number(sortUpdatedAt);

    const datas = await Apply
    .find(filter)
    .sort(_sort)
    .skip(skipNum)
    .limit(pageSize)
    .populate("applyer")
    .populate({
      path: "booking",
      populate: {
        path: "authorId",
      },
    });
   
    return sendSuccess(res,`Get ${dataName} succesfully`, datas, datas.length);

  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};

exports.getOne = async (req, res) => {
  try {
    const {id} = req.params;
    const data = await Apply.findById(id)
    .populate("applyer")
    .populate({
      path: "booking",
      populate: {
        path: "authorId",
      },
    });
    return sendSuccess(res, `Get 1 ${dataName} successfully`, data);
  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};

