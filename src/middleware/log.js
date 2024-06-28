const Log = (req, res, next) => {
  try {
    const userAgent = req.useragent;
    const ip = req.clientIp;

    const clientInfo = {
        source: userAgent.source,
        ip: ip
    };
    
    console.log("client infomation:", clientInfo)
  } catch (err) {
  
  }
  return next();
};

module.exports = Log;