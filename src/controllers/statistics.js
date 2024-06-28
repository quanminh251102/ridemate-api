const { BOOKING_STATUS, MAP_CHART_DATA } = require("../contrants");
const Statistics = require("../models/statistics");
const User = require("../models/user");
const Booking = require("../models/booking");
const { sendSuccess, sendError } = require("../utils/client");

exports.get = async (req, res, next) => {
    try {
        let numUser = 0, numBookingComplete = 0, numBookingAvailable = 0, statistics;
        
    await Promise.all([
        Statistics.findOne().then(value => statistics = value),
        User.count().then(value => {numUser = value;}),
        Booking.count({status: BOOKING_STATUS.complete}).then(value => numBookingComplete = value),
        Booking.count({status: BOOKING_STATUS.available}).then(value => numBookingAvailable = value),
    ]);

    if (!statistics) {
        statistics = await Statistics.create({
            current: {
                user: 0,
                booking_available: 0,
                booking_complete: 0,
                online: 0,
            },
            lastMonth: {
                user: 0,
                booking_available: 0,
                booking_complete: 0,
                online: 0,
            },
            mapChartOnline: MAP_CHART_DATA.DATA,
            lineChartOnline: [
                {lable: '02/2024', value: 5232},
                {lable: '03/2024', value: 4232},
                {lable: '04/2024', value: 3223},            
            ]
        })
    }


    return sendSuccess(res, 'Get Statistics Success', {
        total : {
            user: numUser,
            booking_available: numBookingAvailable,
            booking_complete: numBookingComplete,
            online: statistics.current.online,
        },
        compare: {
            user: (statistics.lastMonth.user - statistics.current.user) / statistics.lastMonth.user  * 100,
            booking_available: 
                (statistics.lastMonth.booking_available - statistics.current.booking_available) / statistics.lastMonth.booking_available * 100,
            booking_complete: 
                (statistics.lastMonth.booking_complete - statistics.current.booking_complete) / statistics.lastMonth.booking_complete * 100,
            online: (statistics.lastMonth.online - statistics.current.online) / statistics.lastMonth.online * 100,
        },
        mapChartOnline: statistics.mapChartOnline,
        lineChartOnline: statistics.lineChartOnline,
    });
    } catch (err) {
        console.log(err);
        sendError(res);
    }
};
