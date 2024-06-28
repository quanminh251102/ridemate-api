const mongoose = require("mongoose");
const Notification = require("../models/notification.js");
const { sendSuccess, sendError, sendServerError} = require("../utils/client.js");
const dataName = "notification";

exports.create = async (req, res, next) => {
    try {
      let data = new Notification({
        receiver: new mongoose.Types.ObjectId(req.user.user_id),
        author: new mongoose.Types.ObjectId(req.user.user_id),
        text: req.body.text,
      });
  
      await data.save();
      return sendSuccess(res, `${dataName} added succesfully`, data);
  
    } catch (error) {
      console.log(error);
      return sendServerError(res);
    }
};

exports.getList = async (req, res, next) => {
  try {
    let filter = {};
    let {page, pageSize, sortCreatedAt, sortUpdatedAt} = req.query;
    let skipNum = 0;

    if (page) page = Number(page);
    else page = 1

    if (pageSize) pageSize = Number(pageSize);
    else pageSize = 20;

    skipNum = (page - 1) * pageSize;
    if (skipNum < 0) skipNum = 0;

      filter.receiver =  new mongoose.Types.ObjectId(req.user.user_id);

    let _sort = {};
    if (sortCreatedAt != null && sortCreatedAt != undefined && sortCreatedAt != '')
      _sort.createdAt = Number(sortCreatedAt);
    if (sortUpdatedAt != null && sortUpdatedAt != undefined && sortUpdatedAt != '')
      _sort.updatedAt = Number(sortUpdatedAt);

    const datas = await Notification
    .find(filter)
    .sort(_sort)
    .skip(skipNum)
    .limit(pageSize)
    .populate("receiver")
    .populate("author");
    
    return sendSuccess(res,`Get ${dataName} succesfully`, datas, datas.length);

  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};