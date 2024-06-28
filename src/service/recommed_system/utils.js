function haversine(lat1, lon1, lat2, lon2) {
    // distance between latitudes and longitudes
    var dLat = (lat2 - lat1) * Math.PI / 180.0;
    var dLon = (lon2 - lon1) * Math.PI / 180.0;

    // convert to radians
    lat1 = lat1 * Math.PI / 180.0;
    lat2 = lat2 * Math.PI / 180.0;

    // apply formulae
    var a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) *
        Math.cos(lat1) * Math.cos(lat2);
    var rad = 6371; // Earth radius in kilometers
    var c = 2 * Math.asin(Math.sqrt(a));
    return rad * c;
}

function timeDifference(startTime, endTime) {
    // Parse the time strings to obtain Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
  
    // Calculate the difference in milliseconds
    const difference = Math.abs(endDate.getTime() - startDate.getTime());
  
    // Convert the difference to hours, minutes, and seconds
    // const hours = Math.floor(difference / 1000 / 60 / 60);
    // const minutes = Math.floor((difference / 1000 / 60) % 60);
    // const seconds = Math.floor((difference / 1000) % 60);
  
    //return { hours, minutes, seconds };
    return (difference / 1000 / 60 / 60 );
  }


exports.getBookingSimWithInput =  (bookings, input, limit) => {
    // startPointLat, startPointLong, endPointLat, endPointLong, time
    for (let i = 0; i < bookings.length; i++) {
      let startPointDis = haversine(
        input.startPointLat, input.startPointLong, 
        bookings[i].startPointLat, bookings[i].startPointLong
      );
      
      let endPointDis = haversine(
        input.endPointLat,  input.endPointLong,
        bookings[i].endPointLat, bookings[i].endPointLong
      );

      let timeDis = timeDifference(input.time, bookings[i].time);

      if (timeDis > 100) timeDis = 100;

      // console.log(startPointDis, endPointDis, timeDis);
      
      // dis theo km khoang [1-30km] vi sinh trong cung 1 tinh
      // timDis tính theo giờ 
      let dis = startPointDis  + endPointDis  + timeDis;


      bookings[i].dis = dis;
    }


    bookings.sort(function compare(a, b) {
      return a.dis < b.dis;
    })

   
    return bookings.slice(0, limit);
}

exports.getCaseBaseSim =  (bookings, booking, limit) => {
  // startPointLat, startPointLong, endPointLat, endPointLong, time

  
  for (let i = 0; i < bookings.length; i++) {
    let startPointDis = haversine(
      booking.startPointLat, booking.startPointLong, 
      bookings[i].startPointLat, bookings[i].startPointLong
    );
    
    let endPointDis = haversine(
      booking.endPointLat,  booking.endPointLong,
      bookings[i].endPointLat, bookings[i].endPointLong
    );
    let priceDis = Math.abs(booking.price - bookings[i].price) / 1000;
    let pointDis = Math.abs(booking.point - bookings[i].point);
    let timeDis = timeDifference(booking.time, bookings[i].time);
    let typeDis = (booking.bookingType === bookings[i].bookingType) ? 0 : 100;

    if (timeDis > 100) timeDis = 100;

    // console.log(startPointDis, endPointDis, timeDis);
    
    // dis theo km khoang [1-30km] vi sinh trong cung 1 tinh
    // timDis tính theo giờ 

    // price khoảng > 1000 nen chia cho 1000
    let dis = 0.3 * startPointDis  + 0.4 * endPointDis  + 0.1 * timeDis + 
    0.05 * priceDis + 0.05 * pointDis + 0.1 *typeDis;


    bookings[i].dis = dis;
  }


  bookings.sort(function compare(a, b) {
    return a.dis < b.dis;
  })

 
  return bookings.slice(0, limit);
}

exports.calculateIV = (diftAtribute, applyNum, watchedNum, savedNum) => {
    let applyValue = 0, watchedValue = 0, savedValue = 0;
    applyValue = Math.min(2, applyNum / 10);
    watchedValue = Math.min(2, watchedNum / 10);
    savedValue = Math.min(2, savedNum / 10);

    return diftAtribute * (applyValue * 0.5 + watchedValue * 0.25 + savedValue * 0.25);
} 

exports.generateRandom = (min, max) => {

  //find diff
 let difference = max - min;

  //generate random number 
 let rand = Math.random();

  //multiply with difference 
 rand = Math.floor(rand * difference);

  //add with min value 
 rand = rand + min;

 return rand;
}