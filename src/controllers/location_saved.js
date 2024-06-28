const mongoose = require("mongoose");
const Review = require("../models/review");
const { sendSuccess, sendError, sendServerError} = require("../utils/client.js");
const dataName = "Location saved";
const LocationSaved = require("../models/location_saved.js");
const { LOCATION_TYPE } = require("../contrants.js");

exports.create = async (req, res, next) => {
  try {
    const {placeName,placeDescription,placeId,placeGeoCode, type} = req.body;
    let data = {
        'user' : new mongoose.Types.ObjectId(req.user.user_id),
    };
    if (type != null && type != undefined && type != ''){
        if (type != LOCATION_TYPE.HOME && type != LOCATION_TYPE.COMPANY 
            && type != LOCATION_TYPE.OTHER) {
                return sendError(res, 'type value error, try these value : home / company / other');
            }
        data['type'] = type;
    }
    await LocationSaved.deleteMany(data);
    
    if (placeName != null && placeName != undefined && placeName != '')
        data['placeName'] = placeName;
    if (placeDescription != null && placeDescription != undefined && placeDescription != '')
        data['placeDescription'] = placeDescription;
    if (placeId != null && placeId != undefined && placeId != '')
        data['placeId'] = placeId;
    if (placeGeoCode != null && placeGeoCode != undefined && placeGeoCode != '')
        data['placeGeoCode'] = placeGeoCode;

    const value = await LocationSaved.create(data);

    return sendSuccess(res, `${dataName} added succesfully`, value);

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

 
    filter.user = new mongoose.Types.ObjectId(req.user.user_id);

    let _sort = {};
    if (sortCreatedAt != null && sortCreatedAt != undefined && sortCreatedAt != '')
      _sort.createdAt = Number(sortCreatedAt);
    if (sortUpdatedAt != null && sortUpdatedAt != undefined && sortUpdatedAt != '')
      _sort.updatedAt = Number(sortUpdatedAt);

    const datas = await LocationSaved
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

exports.getOne = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = await LocationSaved.findById(id);
        return sendSuccess(res, `${dataName} get one succesfully`, data);
    } catch (error) {
      console.log(error);
      return sendServerError(res);
    }
};

exports.update = async (req, res, next) => {
    try {
      const id = req.params.id;


      const {placeName,placeDescription,placeId,placeGeoCode, type} = req.body;
        let data = {
            'user' : new mongoose.Types.ObjectId(req.user.user_id),
        };
        if (type != null && type != undefined && type != ''){
            if (type != LOCATION_TYPE.HOME && type != LOCATION_TYPE.COMPANY 
                && type != LOCATION_TYPE.OTHER) {
                    return sendError(res, 'type value error, try these value : home / company / other');
                }
            data['type'] = type;
        }   
        if (placeName != null && placeName != undefined && placeName != '')
            data['placeName'] = placeName;
        if (placeDescription != null && placeDescription != undefined && placeDescription != '')
            data['placeDescription'] = placeDescription;
        if (placeId != null && placeId != undefined && placeId != '')
            data['placeId'] = placeId;
        if (placeGeoCode != null && placeGeoCode != undefined && placeGeoCode != '')
            data['placeGeoCode'] = placeGeoCode;

        const value = await LocationSaved.findByIdAndUpdate(id, data, {
            new: true
        });

        return sendSuccess(res, `${dataName} update succesfully`, value);
    
    } catch (error) {
      console.log(error);
      return sendServerError(res);
    }
  };

exports.delete = async (req, res, next) => {
    try {
      const id = req.params.id;
      await LocationSaved.findByIdAndRemove(id);
      return sendSuccess(res, `${dataName} delete succesfully`);
    } catch (error) {
      console.log(error);
      return sendServerError(res);
    }
};