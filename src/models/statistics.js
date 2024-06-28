const mongoose = require("mongoose");

const statisticsSchema = mongoose.Schema({
    current: {
        user: { type: Number },
        booking_available: { type: Number },
        booking_complete: { type: Number },
        online: { type: Number },
    },
    lastMonth: {
        user: { type: Number },
        booking_available: { type: Number },
        booking_complete: { type: Number },
        online: { type: Number },
    },
    mapChartOnline: [{
        "alt-name": { type: String },
        "hc-key": { type: String },
        "longitude": { type: Number },
        "latitude": { type: Number },
        "value": { type: Number },
    }],
    lineChartOnline: [{
        "lable": { type: String },
        "value": { type: Number },
    }],
},
);

module.exports = mongoose.model("statistics", statisticsSchema)