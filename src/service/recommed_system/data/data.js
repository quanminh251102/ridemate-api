const mongoose = require("mongoose");
const Booking = require('../../../models/booking');
const User = require('../../../models/user');
const readXlsxFile = require('read-excel-file/node')
const { getCaseBaseSim, calculateIV, generateRandom } = require('../utils');
const { BOOKING_STATUS, USER_GENDER } = require('../../../contrants');
const bcrypt = require("bcryptjs");
const { calculateICVForNewItem } = require("../recommend_system");
const MONGODB_URI = "mongodb+srv://vercel-admin-user:xz3IckPXwH3uyR2t@cluster0.ynhdj.mongodb.net/test"

function diff_minutes(dt2, dt1) {
    // Calculate the difference in milliseconds between the two provided dates and convert it to seconds
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    // Convert the difference from seconds to minutes
    diff /= 60;
    // Return the absolute value of the rounded difference in minutes
    return Math.abs(Math.round(diff));
}

async function connectDb() {
    await mongoose
        .connect(MONGODB_URI, {});
    console.log('connecting to mongodb successfully ');
}

async function addBookingCaseBase() {
    await connectDb();

    let startTime = new Date();
    console.log('-> read booking xlsx...');

    let rows = await readXlsxFile(process.cwd() + '/src/service/recommed_system/data/booking_1_data.xlsx');
    console.log('Done read -> save booking ...');

    rows.shift();
    let datas = rows.map((row) => {
        return new Booking({
            startPointMainText: row[0],
            startPointAddress: row[1],
            startPointLat: row[2],
            startPointLong: row[3],
            endPointMainText: row[4],
            endPointAddress: row[5],
            endPointLat: row[6],
            endPointLong: row[7],
            'distance': row[8],
            bookingType: row[9],
            price: row[10],
            applyNum: row[11],
            watchedNum: row[12],
            savedNum: row[13],
            time: new Date(row[14]),
            point: row[15],
            diftAtribute: row[16],
            interesestValue: calculateIV(row[16], row[11], row[12], row[13]),
            status: row[17],
            // userFavorites: [],
            // userMayFavorites: [],
        })
    })
    let querys = [];
    datas.forEach(async element => {
        querys.push(element.save());
    });
    await Promise.all(querys);

    // for (let i = 0; i < datas.length; i++) {
    //     await  datas[i].save();
    //     console.log(i);
    // }


    console.log(`Done: ${diff_minutes(new Date(), startTime)} minutes`);
}

async function addBookingNew() {
    await connectDb();

    let startTime = new Date();
    console.log('-> read booking xlsx...');

    let rows = await readXlsxFile(process.cwd() + '/src/service/recommed_system/data/booking_2_data.xlsx');
    console.log('Done read -> save booking ...');

    rows.shift();

    let user = await User.find({}).lean();
    rows.map(async (row) => {
        let booking  = new Booking({
            authorId : new mongoose.Types.ObjectId(user[generateRandom(0,user.length )]._id),
            startPointMainText: row[0],
            startPointAddress: row[1],
            startPointLat: row[2],
            startPointLong: row[3],
            endPointMainText: row[4],
            endPointAddress: row[5],
            endPointLat: row[6],
            endPointLong: row[7],
            'distance': row[8],
            bookingType: row[9],
            price: row[10],
            applyNum: row[11],
            watchedNum: row[12],
            savedNum: row[13],
            time: new Date(row[14]),
            point: row[15],
            diftAtribute: row[16],
            // interesestValue: calculateIV(row[16], row[11], row[12], row[13]),
            status: row[17],
        })
        await calculateICVForNewItem(booking);
    })


    console.log(`Done: ${diff_minutes(new Date(), startTime)} minutes`);
}

function calICV(bookings) {
    let sum_sim = 0, icv = 0;
    for (let i = 0; i < bookings.length; i++) {
        icv += bookings[i].dis * bookings[i].interesestValue;
        sum_sim += bookings[i].dis;
    }
    if (sum_sim != 0) {
        icv = icv / sum_sim;
    }
    return icv;
}

const randomFloat = (min, max) => Math.random() * (max - min) + min;

async function calValueEvaluate(trains, tests, k) {
    let rmse = 0, rsquare = 0, SSR = 0, SST = 0, averageTrainIV = 0;
    for (let i = 0; i < trains.length; i++) {
        averageTrainIV += trains[i].interesestValue;
        // averageTrainIV += randomFloat(0,3);
    }

    averageTrainIV = averageTrainIV / trains.length;

    for (let i in tests) {
        let booking = tests[i];
        let bookingSimiliars = getCaseBaseSim(trains, booking, k);

        //console.log(`Input: ${booking.startPointMainText} -  ${booking.endPointMainText}`);
        //for (let j in bookingSimiliars)
        //console.log(`   ${bookingSimiliars[j].startPointMainText} -  ${bookingSimiliars[j].endPointMainText}`);

        // console.log(bookingSimiliars);

        let icv_predict = calICV(bookingSimiliars);
        let icv_true = booking.interesestValue;

        // let icv_predict = randomFloat(0,3);
        // let icv_true = randomFloat(0,3);

        // console.log(icv_predict,' ', icv_true)
        rmse += (icv_predict - icv_true) * (icv_predict - icv_true)
        // return;

        SSR += (icv_predict - icv_true) * (icv_predict - icv_true);
        SST += (icv_true - averageTrainIV) * (icv_true - averageTrainIV);
        // return;
    }

    rmse = Math.sqrt(rmse / tests.length);
    rsquare = 1 - (SSR / SST);
    console.log(`K = ${k}; RMSE: ${rmse}; SSR : ${SSR}; SST : ${SST}; Rsquare: ${rsquare}`);
}

async function evaluateGenData() {
    //https://medium.com/@paul0/evaluating-recommender-systems-4915c22ad44a
    await connectDb();
    let bookings = await Booking.aggregate([
        {
            $match:
            {
                status: BOOKING_STATUS.complete,
                authorId: null,
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
                'price': 1,
                'bookingType': 1,
                'interesestValue': 1,
                'applyNum': 1,
                'watchedNum': 1,
                'savedNum': 1,
                'diftAtribute': 1,
                'startPointMainText': 1,
                'endPointMainText': 1.
            }
        },
    ]);
    // console.log(bookings.length);
    let trains = [], tests = [];

    for (let i = 0; i < bookings.length; i++) {
        if (i + 1 <= bookings.length * 0.7) {
            trains.push(bookings[i]);
        }
        else {
            tests.push(bookings[i]);
        }
    }

    // for (let k = 1 ; k <= 30; k++)
    //     calValueEvaluate(trains, tests, k);      

    calValueEvaluate(trains, tests, 3);
}

async function addUser() {
    await connectDb();

    let startTime = new Date();
    console.log('-> read user xlsx...');

    let rows = await readXlsxFile(process.cwd() + '/src/service/recommed_system/data/user_data.xlsx');
    console.log('Done read -> save user ...');

    //Encrypt user password
    let encryptedPassword = await bcrypt.hash('12345678', 10);

    rows.shift();
    let datas = rows.map((row) => {
        return new User({
            'firstName' : row[0],
            'email': row[1].toLowerCase(), // sanitize: convert email to lowercase
            'password': encryptedPassword,
            'birthDate': new Date(),
            'gender': row[2] == 'Male' ? USER_GENDER.MALE : USER_GENDER.FEMALE ,
            'age': Number(row[3]),
            'phoneNumber' : row[5],
            // Add default avatar
            avatarUrl: row[4]
        })
    })
    let querys = [];
    datas.forEach(async element => {
        querys.push(element.save());
    });
    await Promise.all(querys);

    console.log(`Done: ${diff_minutes(new Date(), startTime)} minutes`);
}


// addUser();

// addBookingCaseBase();

// addBookingNew();

// evaluateGenData();

