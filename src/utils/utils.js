const { geocoordinateToGeohash } = require("geocoordinate-to-geohash");

const splitAddress = (pointMainText, pointAddress) => {
    pointAddress = stringToSlug(pointAddress)
    pointMainText = stringToSlug(pointMainText)
    
    let result = {
      'level1' : pointMainText
    }
    let strs = pointAddress.replaceAll(" ","").split(',');

    let pos = 4;
    for (let i = strs.length - 1; i >= Math.max(strs.length - 3,0); i--){
      if (pos > -1) {
        result[`level${pos}`] = strs[i]; 
        pos--
      }
    }
    if (strs.length - 4 >= 0){
      for (let i = 0 ; i <= strs.length - 4;i++) {
        result.level1 += strs[i]
      }
    }
    return result;
}

const stringToSlug = (str) => {
  if (str == null || str == undefined)  return "";
  // remove accents
  var from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
      to   = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
  for (var i=0, l=from.length ; i < l ; i++) {
    str = str.replace(RegExp(from[i], "gi"), to[i]);
  }

  str = str.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\-]/g, '-')
        .replace(/-+/g, '-');

  return str;
}

const geoHash = (latitude,longitude, precision = 8 ) =>{
  return geocoordinateToGeohash({
    latitude,
    longitude,
    precision,
  });
}

const timeDifference = (startTime, endTime) => {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const difference = Math.abs(endDate.getTime() - startDate.getTime());
  return (difference / 1000 / 60);
}

const compareGeohashes = (geohash1, geohash2) => {
  // Find the length of common prefix of two geohashes
  var commonPrefixLength = 0;
  for (var i = 0; i < Math.min(geohash1.length, geohash2.length); i++) {
      if (geohash1[i] !== geohash2[i]) {
          break;
      }
      commonPrefixLength++;
  }

  // Calculate similarity percentage
  var similarityPercentage = (commonPrefixLength / geohash1.length) * 100;

  return similarityPercentage;
}
module.exports = {
  splitAddress,
  stringToSlug,
  geoHash,
  timeDifference,
  compareGeohashes,
}