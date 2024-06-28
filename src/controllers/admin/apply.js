const mongoose = require("mongoose");
const Apply = require("../../models/apply");
const Booking = require("../../models/booking");
const { sendSuccess, sendError, sendServerError} = require("../../utils/client.js");
const dataName = "booking";

exports.update = async (req, res, next) => {
  try {
    let id = req.params.id;

    const data = await Apply.findByIdAndUpdate(id, req.body, {new : true})
    .populate("applyer")
    .populate({
      path: "booking",
      populate: {
        path: "authorId",
      },
    });

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

exports.delete = async (req, res) => {
    try {
      const {id} = req.params;
      const data = await Apply.findByIdAndRemove(id);
      return sendSuccess(res, `Get 1 ${dataName} successfully`, data);
    } catch (e) {
      console.log(e);
      return sendServerError(res);
    }
};
  

