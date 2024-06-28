const sendSuccess = (res, message, data = null, total = null) => {
    let responseJson = {
        success: true,
        message: message
    }

    if (total) responseJson.total = total
    if (data) responseJson.data = data
    return res.status(200).json(responseJson)
}

const sendError = (res, message, code = 400) => {
    return res.status(code).json({
        success: false,
        message: message
    })
}

const sendServerError = res =>
    res.status(500).json({
        success: false,
        message: 'Server Interval Error.'
    })

module.exports = {
    sendSuccess,
    sendError,
    sendServerError,
};
      