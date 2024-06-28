const Booking = require("../../models/booking.js");
const mongoose = require("mongoose");
const { sendSuccess, sendError, sendServerError} = require("../../utils/client.js");

exports.create = (req, res) => {
  try {
    const booking = new Booking({
      authorId: req.user.user_id,
      price: req.body.price,
      status: 'available',
      bookingType: req.body.bookingType,
      time: req.body.time,
      content: req.body.content,
      startPointLat: req.body.startPointLat,
      startPointLong: req.body.startPointLong,
      startPointId: req.body.startPointId,
      startPointMainText: req.body.startPointMainText,
      startPointAddress: req.body.startPointAddress,
      endPointLat: req.body.endPointLat,
      endPointLong: req.body.endPointLong,
      endPointLatLng: req.body.endPointLng,
      endPointId: req.body.endPointId,
      endPointMainText: req.body.endPointMainText,
      endPointAddress: req.body.endPointAddress,
      duration: req.body.duration,
      distance: req.body.distance,
    });
    
    booking
      .save()
      .then((result) => {
          return sendSuccess(res,"Booking added succesfully", result);
      })
      .catch((err) => {
        res.status(500).json({
          message: "Fail to create todo!",
        });
      });
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};

exports.getList = async (req, res) => {
  try {
    let filter = {};
    let {page, pageSize, sortCreatedAt, sortUpdatedAt, status, authorId} = req.query;
    let skipNum = 0;

    if (page) page = Number(page);
    else page = 1

    if (pageSize) pageSize = Number(pageSize);
    else pageSize = 20;

    skipNum = (page - 1) * pageSize;
    if (skipNum < 0) skipNum = 0;

    if (status != null && status != undefined && status != '') filter.status = status;
    if (authorId != null && authorId != undefined && authorId != '') filter.authorId = new mongoose.Types.ObjectId(authorId);

    let _sort = {};
    if (sortCreatedAt != null && sortCreatedAt != undefined && sortCreatedAt != '')
       _sort.createdAt = Number(sortCreatedAt);

    if (sortUpdatedAt != null && sortUpdatedAt != undefined && sortUpdatedAt != '')
       _sort.updatedAt = Number(sortUpdatedAt);

    const bookings = await Booking
    .find(filter)
    .sort(_sort)
    .skip(skipNum)
    .limit(pageSize)
    .populate("authorId")
    
    return sendSuccess(res,"Get bookings succesfully", bookings, bookings.length);

  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};

exports.getOne = async (req, res) => {
  try {
    const {id} = req.params;
    const booking = await Booking.findById(id).populate("authorId");
    return sendSuccess(res, "Get 1 booking successfully", booking);
  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};

exports.delete = async (req, res) => {
    try {
      const {id} = req.params;
      const booking = await Booking.findByIdAndRemove(id);
      return sendSuccess(res, "Get 1 booking successfully", booking);
    } catch (e) {
      console.log(e);
      return sendServerError(res);
    }
};

exports.update = async (req, res) => {
    try {
      const {id} = req.params;
      const booking = await Booking.findByIdAndUpdate(id, res.body);
      return sendSuccess(res, "Get 1 booking successfully", booking);
    } catch (e) {
      console.log(e);
      return sendServerError(res);
    }
};
