const Booking = require("../models/booking.js");
const Apply = require("../models/apply.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const mongoose = require("mongoose");
const {
  sendSuccess,
  sendError,
  sendServerError,
} = require("../utils/client.js");
const {
  splitAddress,
  stringToSlug,
  geoHash,
  timeDifference,
  compareGeohashes,
} = require("../utils/utils.js");
const { BOOKING_STATUS } = require("../contrants.js");
const {
  recommedBookings,
  calculateICVForNewItem,
  updateCaseBaseSolution,
  saveNewCaseBase,
} = require("../service/recommed_system/recommend_system.js");

exports.create = async (req, res) => {
  try {
    let user = await User.findById(req.user.user_id);

    const booking = new Booking({
      authorId: req.user.user_id,
      price: req.body.price,
      status: BOOKING_STATUS.available,
      bookingType: req.body.bookingType,
      time: new Date(req.body.time),
      content: req.body.content,
      // startPoint
      startPointLat: Number(req.body.startPointLat),
      startPointLong: Number(req.body.startPointLong),
      startPointId: req.body.startPointId,
      startPointMainText: req.body.startPointMainText,
      startPointAddress: req.body.startPointAddress,
      // endPoint
      endPointLat: Number(req.body.endPointLat),
      endPointLong: Number(req.body.endPointLong),
      endPointLatLng: req.body.endPointLng,
      endPointId: req.body.endPointId,
      endPointMainText: req.body.endPointMainText,
      endPointAddress: req.body.endPointAddress,
      //
      duration: req.body.duration,
      distance: req.body.distance,
      point: user.priorityPoint,
    });

    let result = await booking.save();
    user.booking = result.id;

    await Promise.all([user.save(), calculateICVForNewItem(booking)]);

    return sendSuccess(res, "Booking added succesfully", result);
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    let booking = null;
    await Promise.all([
      Booking.findByIdAndUpdate(id, {
        authorId: req.user.user_id,
        price: req.body.price,
        // status: req.body.status,
        bookingType: req.body.bookingType,
        time: new Date(req.body.time),
        content: req.body.content,
        // startPoint
        startPointLat: Number(req.body.startPointLat),
        startPointLong: Number(req.body.startPointLong),
        startPointId: req.body.startPointId,
        startPointMainText: req.body.startPointMainText,
        startPointAddress: req.body.startPointAddress,
        // endPoint
        endPointLat: Number(req.body.endPointLat),
        endPointLong: Number(req.body.endPointLong),
        endPointLatLng: req.body.endPointLng,
        endPointId: req.body.endPointId,
        endPointMainText: req.body.endPointMainText,
        endPointAddress: req.body.endPointAddress,
        //
        duration: req.body.duration,
        distance: req.body.distance,
        //point: user.priorityPoint
      })
        .populate("authorId")
        .then((value) => {
          booking = value;
        }),
    ]);

    return sendSuccess(res, "Booking update succesfully", booking);
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};

exports.updateSome = async (req, res) => {
  try {
    const { id } = req.params;
    const { applyNum, watchedNum, savedNum, status } = req.body;
    let value = {};
    let check = false;

    if (applyNum != null && applyNum != undefined && applyNum != "") {
      check = true;
      value.applyNum = 1;
    }

    if (watchedNum != null && watchedNum != undefined && watchedNum != "") {
      check = true;
      value.watchedNum = 1;
    }

    if (savedNum != null && savedNum != undefined && savedNum != "") {
      check = true;
      value.savedNum = 1;
    }

    if (check == true) value = { $inc: value };

    // if (status != null && status != undefined && status != '') {
    //   value['status'] = status;
    // }

    let booking = await Booking.findByIdAndUpdate(id, value).lean();

    return sendSuccess(res, "Booking update succesfully");
  } catch (err) {
    console.log(err);
    return sendServerError(res);
  }
};

exports.getList = async (req, res) => {
  try {
    let filter = [];

    let {
      page,
      pageSize,
      keyword,
      //sortCreatedAt, sortUpdatedAt,
      status,
      authorId,
      minPrice,
      maxPrice,
      startAddress,
      endAddress,
      startTime,
      endTime,
      bookingType,
      isFavorite,
      isMayFavorite,
      isMine,
      id,
    } = req.query;
    console.log(req.query);
    startAddress = stringToSlug(startAddress);
    endAddress = stringToSlug(endAddress);

    let skipNum = 0;

    if (page) page = Number(page);
    else page = 1;

    if (pageSize) pageSize = Number(pageSize);
    else pageSize = 20;

    skipNum = (page - 1) * pageSize;
    if (skipNum < 0) skipNum = 0;

    if (id != null && id != undefined && id != "")
      filter.push({ _id: new mongoose.Types.ObjectId(id) });
    if (isFavorite != null && isFavorite != undefined && isFavorite != "")
      filter.push({ isFavorite: isFavorite === "true" });
    if (
      isMayFavorite != null &&
      isMayFavorite != undefined &&
      isMayFavorite != ""
    )
      filter.push({ isMayFavorite: isMayFavorite === "true" });
    if (isMine != null && isMine != undefined && isMine != "") {
      if (isMine === "true") {
        filter.push({
          authorId: new mongoose.Types.ObjectId(req.user.user_id),
        });
      } else {
        filter.push({
          $nor: [
            {
              authorId: new mongoose.Types.ObjectId(req.user.user_id),
            },
          ],
        });
      }
    }

    if (bookingType != null && bookingType != undefined && bookingType != "")
      filter.push({ bookingType: bookingType });
    if (status != null && status != undefined && status != "")
      filter.push({ status: Number(status) });
    if (authorId != null && authorId != undefined && authorId != "")
      filter.push({ authorId: new mongoose.Types.ObjectId(authorId) });

    let priceRange = {};

    if (minPrice != null && minPrice != undefined && minPrice != "") {
      minPrice = Number(minPrice);
      priceRange["$gte"] = minPrice;
    }

    if (maxPrice != null && maxPrice != undefined && maxPrice != "") {
      maxPrice = Number(maxPrice);
      priceRange["$lte"] = maxPrice;
    }

    if (Object.keys(priceRange).length > 0) filter.push({ price: priceRange });

    let keyWordFilter = {};
    if (keyword != null && keyword != undefined && keyword != "") {
      keyWordFilter = {
        $text: {
          $search: keyword,
          $caseSensitive: false,
          $diacriticSensitive: false,
        },
      };
    }

    if (
      startAddress != null &&
      startAddress != undefined &&
      startAddress != ""
    ) {
      filter.push({
        $or: [
          { startPointMainText: { $regex: startAddress, $options: "i" } },
          { startPointAddress: { $regex: startAddress, $options: "i" } },
        ],
      });
    }

    if (endAddress != null && endAddress != undefined && endAddress != "") {
      filter.push({
        $or: [
          { endPointMainText: { $regex: endAddress, $options: "i" } },
          { endPointAddress: { $regex: endAddress, $options: "i" } },
        ],
      });
    }

    let timeRange = {};

    if (startTime != null && startTime != undefined && startTime != "") {
      timeRange["$gte"] = new Date(startTime);
    }

    if (endTime != null && endTime != undefined && endTime != "") {
      timeRange["$lte"] = new Date(endTime);
    }

    if (Object.keys(timeRange).length > 0)
      filter.push({ createdAt: timeRange });

    let _sort = {
      status: -1,
      point: -1,
      createdAt: -1,
    };

    // if (sortCreatedAt != null && sortCreatedAt != undefined && sortCreatedAt != '')
    //    _sort.createdAt = Number(sortCreatedAt);

    // if (sortUpdatedAt != null && sortUpdatedAt != undefined && sortUpdatedAt != '')
    //    _sort.updatedAt = Number(sortUpdatedAt);

    console.log(filter);

    if (filter.length == 0) filter = {};
    else
      filter = {
        $and: filter,
      };

    let bookings = await Booking.aggregate([
      { $match: keyWordFilter },
      {
        $addFields: {
          isFavorite: {
            $cond: {
              // Conditionally set isHave based on the presence of value_x in users
              if: { $in: [req.user.user_id, "$userFavorites"] }, // Check if value_x exists in the users array
              then: true, // Set isHave to true if value_x exists
              else: false, // Set isHave to false otherwise
            },
          },
          isMayFavorite: {
            $cond: {
              // Conditionally set isHave based on the presence of value_x in users
              if: { $in: [req.user.user_id, "$userMayFavorites"] }, // Check if value_x exists in the users array
              then: true, // Set isHave to true if value_x exists
              else: false, // Set isHave to false otherwise
            },
          },
        },
      },

      { $match: filter }, // Match documents based on the filter
      { $sort: _sort }, // Sort the matched documents

    { $facet: {
      count:  [{ $count: "count" }],
      data: [
        { $skip: skipNum }, // Skip documents for pagination
        { $limit: pageSize }, // Limit the number of documents per page
        { $lookup: { // Populate the "authorId" field
            from: "users", // Assuming "authors" is the collection name
            localField: "authorId",
            foreignField: "_id",
            as: "authorId"
          }
        },
        { $unwind: "$authorId" } // Deconstruct the "author" array
      ]
    }},  
  ]);

  let data = bookings[0].data;
  for (let i = 0; i < data.length ; i ++){
    bookings[0].data[i].id = bookings[0].data[i]._id;
    bookings[0].data[i].authorId.id = bookings[0].data[i].authorId._id;
    delete bookings[0].data[i]._id;
    delete bookings[0].data[i].authorId._id;
    delete bookings[0].data[i].__v;
    delete bookings[0].data[i].authorId.__v;
  }
    return sendSuccess(res,"Get bookings succesfully", bookings[0].data, bookings[0].count[0].count);

  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};

exports.getRecommend = async (req, res) => {
  try {
    let { type } = req.query;
    let input = {};
    if (type == "from_input") {
      input = {
        startPointLat: Number(req.query.startPointLat),
        startPointLong: Number(req.query.startPointLong),
        endPointLat: Number(req.query.endPointLat),
        endPointLong: Number(req.query.endPointLong),
        time: new Date(),
      };
    }
    if (type == "from_user") {
      let user = await User.findById(req.user.user_id).populate("booking");
      if (user.booking == null) {
        return sendError(
          res,
          "Current user not have interact (apply, watch, save) with any booking"
        );
      }
      input = {
        startPointLat: Number(user.booking.startPointLat),
        startPointLong: Number(user.booking.startPointLong),
        endPointLat: Number(user.booking.endPointLat),
        endPointLong: Number(user.booking.endPointLong),
        time: new Date(),
      };
    }

    let bookings = await recommedBookings(input);

    let bookingIds = bookings.map((value) => {
      return value._id;
    });

    let _bookings = await Booking.find({ _id: { $in: bookingIds } })
      .sort({ interesestConfidenceValue: -1 })
      .populate("authorId");

    return sendSuccess(
      res,
      "Get recommend bookings succesfully",
      _bookings,
      _bookings.length
    );
  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const applys = await Apply.find({ booking: id }).lean();
    const applyIds = applys.map((apply) => apply._id);

    await Promise.all([
      Booking.findByIdAndDelete(id),
      Apply.deleteMany({ _id: { $in: applyIds } }),
      Review.deleteMany({ apply: { $in: applyIds } }),
    ]);
    await Booking.findByIdAndDelete(id);
    return sendSuccess(res, "Delete 1 booking successfully");
  } catch (e) {
    console.log(e);
    return sendServerError(res);
  }
};

exports.getBookingInChatBot = async (req, res) => {
  try {
    let { type } = req.body.queryResult.parameters;
    console.log(req.body);

    let input = {};
    if (type == "from_input") {
      input = {
        startPointLat: Number(req.body.queryResult.parameters.startPointLat),
        startPointLong: Number(req.body.queryResult.parameters.startPointLong),
        endPointLat: Number(req.body.queryResult.parameters.endPointLat),
        endPointLong: Number(req.body.queryResult.parameters.endPointLong),
        time: new Date(),
      };
    }
    if (type == "from_user") {
      let user = await User.findById(req.user.user_id).populate("booking");
      if (user.booking == null) {
        return sendError(
          res,
          "Current user not have interact (apply, watch, save) with any booking"
        );
      }
      input = {
        startPointLat: Number(user.booking.startPointLat),
        startPointLong: Number(user.booking.startPointLong),
        endPointLat: Number(user.booking.endPointLat),
        endPointLong: Number(user.booking.endPointLong),
        time: new Date(),
      };
    }

    let bookings = await recommedBookings(input);

    let bookingIds = bookings.map((value) => {
      return value._id;
    });

    let _bookings = await Booking.find({ _id: { $in: bookingIds } })
      .sort({ interesestConfidenceValue: -1 })
      .populate("authorId");

    return res.send({
      fulfillmentMessages: [
        {
          text: {
            text: ["Đây là chuyến đi phù hợp nhất cho bạn"],
          },
        },
      ],
      payload: _bookings[0],
    });
  } catch (e) {
    console.log(e);
    return res.send({
      fulfillmentMessages: [
        {
          text: {
            text: ["Xảy ra lổi"],
          },
        },
      ],

      payload: null,
    });
  }
};
