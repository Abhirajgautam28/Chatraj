export const successResponse = (res, data = {}, message = 'Success', status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data
    });
};

export const errorResponse = (res, message = 'Internal Server Error', status = 500, errors = null) => {
    return res.status(status).json({
        success: false,
        message,
        errors
    });
};
