

const successResponse = (res, status, message, statusCode = 200, data = null) => {
    const response = {
        Success: status,
        message: message,
    };

    if (data !== null) {
        response.data = data;
    }

    res.status(statusCode).json(response);
};



const errorResponse = (res, message, statusCode, data = null) => {
    const response = {
        Success: false,
        errors: [{ message }]
    };

    if (data !== null) {
        response.data = data;
    }

     res.status(statusCode).json(response);
};

module.exports = {
    successResponse,
    errorResponse
}
