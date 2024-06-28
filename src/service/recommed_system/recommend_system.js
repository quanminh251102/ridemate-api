const { BOOKING_STATUS } = require('../../contrants');
const Booking = require('../../models/booking');
const { getBookingSimWithInput, calculateIV } = require('./utils');
let increaseFator = 0.01;
let decreaseFator = 0.01;
let minForDriftAtribute = -1;
let minICV = -1;

exports.recommedBookings = async (input) => {
    try {
        // startPointLat, startPointLong, endPointLat, endPointLong, time
        // get from kdTreeForRecommend
        let bookings = await Booking.aggregate([
            {
                $match:
                {
                    status: BOOKING_STATUS.available,
                }
            },
            {

                $project: {
                    'startPointLat': 1,
                    'startPointLong': 1,
                    'endPointLat': 1,
                    'endPointLong': 1,
                    'time': 1,
                }
            },
        ]);

        bookings = getBookingSimWithInput(bookings, input, 10);

        return bookings;
    } catch (err) {
        throw (err);
    }
}

exports.calculateICVForNewItem = async (booking) => {
    try {

        // retrive: get similarity case-base - booking
        let bookings = await Booking.aggregate([
            {
                $match:
                {
                    status: BOOKING_STATUS.complete,
                }
            },
            {
                $project: {
                    'startPointLat': 1,
                    'startPointLong': 1,
                    'endPointLat': 1,
                    'endPointLong': 1,
                    'time': 1,
                    'point': 1,
                    'price' :1,
                    'bookingType': 1,
                    'interesestValue' : 1,
                }
            },
        ]);
        bookings = getBookingSimWithInput(bookings, booking, 10);

        let sum_sim = 0, icv = 0;
        for (let i = 0; i < bookings.length; i++){
            icv += bookings[i].dis * bookings[i].interesestValue;
            sum_sim += bookings[i].dis;
        }
        
        let bookingIds = bookings.map((value) => {return value._id;});

        if (sum_sim != 0){
            booking.interesestConfidenceValue = icv / sum_sim;
            booking.caseBaseUsed = bookingIds;
            await booking.save();
        }
        // reuse: 
  

        // Revise decreaseAllDriftAtribute
        await Booking.updateMany({
            status: BOOKING_STATUS.complete,
        }, {
            $inc: { diftAtribute: decreaseFator }
        });

    } catch (error) {
        throw error;
    }

}

// retain
exports.saveNewCaseBase = async (id) => {
    try {
        let booking = await Booking.findById(id);
        // cal iv
        booking.interesestValue = 
            calculateIV(booking.diftAtribute,booking.applyNum,booking.watchedNum,booking.savedNum);
        booking.status =  BOOKING_STATUS.complete;
        await booking.save();
    } catch (error) {
        throw error;
    }
}


