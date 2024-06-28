 const readXlsxFile = require('read-excel-file/node')
 const writeXlsxFile = require('write-excel-file/node')
 const fs = require('fs');
 const XLSX = require('xlsx'); 
const { BOOKING_STATUS } = require('../../../contrants');

 function generateRandom(min, max) {

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

 function haversine(lat1, lon1, lat2, lon2) {
     //distance between latitudes and longitudes
     var dLat = (lat2 - lat1) * Math.PI / 180.0;
     var dLon = (lon2 - lon1) * Math.PI / 180.0;

     //convert to radians
     lat1 = lat1 * Math.PI / 180.0;
     lat2 = lat2 * Math.PI / 180.0;

     //apply formulae
     var a = Math.pow(Math.sin(dLat / 2), 2) +
         Math.pow(Math.sin(dLon / 2), 2) *
         Math.cos(lat1) * Math.cos(lat2);
     var rad = 6371; //Earth radius in kilometers
     var c = 2 * Math.asin(Math.sqrt(a));
     return rad * c;
 }

 function tinhGiaCuoc(n) {
     const giaCuocDauTien = 12500; //Giá cước cho 2km đầu tiên
     const giaCuocMoiKm = 4300; //Giá cước cho mỗi km tiếp theo

     //Nếu n nhỏ hơn hoặc bằng 2, chỉ cần tính giá cước cho 2km đầu tiên
     if (n <= 2) {
         return giaCuocDauTien;
     }

     //Tính giá cước cho các km tiếp theo sau 2km đầu tiên
     const soKmTiepTheo = n - 2;
     const giaCuocTiepTheo = soKmTiepTheo * giaCuocMoiKm;

     //Tổng giá cước là giá cước cho 2km đầu tiên cộng với giá cước cho các km tiếp theo
     const tongGiaCuoc = giaCuocDauTien + giaCuocTiepTheo;

     return tongGiaCuoc;
 }

 const generateRandomDOB = () => {
     const random = getRandomDate(new Date('2024-01-12T01:57:45.271Z'), new Date('2024-03-12T01:57:45.271Z'))
     return random.toISOString();
 }

 function getRandomDate(from, to) {
     const fromTime = from.getTime();
     const toTime = to.getTime();
     return new Date(fromTime + Math.random() * (toTime - fromTime));
 }

 const randomFloat = (min, max) => Math.random() * (max - min) + min;

 async function genBooking(typeGen, limit) {
     console.log('Doing....');
     let rows = await readXlsxFile(process.cwd() + '/src/service/recommed_system/data/address_data.xlsx');
     console.log('Done read address...')

     let listAddress = rows.slice(1, 10);
    

    //   console.log(listAddress);
    //   console.log(listAddress.length)

     let numAddress = listAddress.length

     let bookings = [];
     let num_gen_bookings = limit;

     for (let i = 1; i <= num_gen_bookings; i++) {
         let startIndex = generateRandom(0, numAddress);
         let endIndex = generateRandom(0, numAddress);

         while (startIndex == endIndex) {
             startIndex = generateRandom(0, numAddress);
             endIndex = generateRandom(0, numAddress);
         }

         let startAddress = listAddress[startIndex];
         let endAddress = listAddress[endIndex];

         let distance = haversine(startAddress[2], startAddress[3], endAddress[2], endAddress[3]);

         let type = generateRandom(0, 2) == 0 ? 'Tìm tài xế' : 'Tìm hành khách';

         let time = generateRandomDOB();
        //from grabbike
         let priceArg = tinhGiaCuoc(distance)
         let price = generateRandom(priceArg - 5000, priceArg + 5000);
         let applyNum = 0, watchedNum = 0, savedNum = 0, point = 0, diftAtribute ;
         point = generateRandom(0, 100)

         //những giá cao thì có ít tương tác
         if (price > priceArg || point < 50) {
             applyNum = generateRandom(0, 10);
             watchedNum = generateRandom(0, 15);
             savedNum = generateRandom(0, 10);     
            //  diftAtribute = (applyNum + watchedNum + savedNum) * 0.01 
            // diftAtribute = randomFloat(0.1, 0.49);
         }
         else {
             applyNum = generateRandom(11, 25);
             watchedNum = generateRandom(16, 50);
             savedNum = generateRandom(16, 25);
            //  diftAtribute = randomFloat(0.51, 0.9);
         }
        //  diftAtribute = (applyNum + watchedNum + savedNum) * 0.01 

        diftAtribute = 1;
        
         bookings.push({
             startPointMainText: startAddress[0],
             startPointAddress: startAddress[1],
             startPointLat: startAddress[2],
             startPointLong: startAddress[3],
             endPointMainText: endAddress[0],
             endPointAddress: endAddress[1],
             endPointLat: endAddress[2],
             endPointLong: endAddress[3],
             'distance' : distance.toString(),
             bookingType: type,
             price,
             applyNum, watchedNum, savedNum, time,
             point,
             diftAtribute,
             status: typeGen
         })
     }

     const ws = XLSX.utils.json_to_sheet(bookings)
     const wb = XLSX.utils.book_new()
     XLSX.utils.book_append_sheet(wb, ws, 'Responses')
     await XLSX.writeFile(wb, process.cwd() 
     + `/src/service/recommed_system/data/booking_${typeGen}_data.xlsx`)
    
     /*
     //write json
      fs.writeFileSync(process.cwd() + '/src/service/recommed_system/data/booking_data.json', 
          JSON.stringify(bookings));
          */

     console.log('Done.')
 }

//case base
// genBooking(BOOKING_STATUS.complete, 1000);

//test recommend
// genBooking(BOOKING_STATUS.available, 100);


