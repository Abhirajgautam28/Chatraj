/**
 * Standard API success response helper.
 */
export const successResponse = (res, data, message = 'Success', status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        ...data
    });
};

/**
 * Standard API error response helper.
 */
export const errorResponse = (res, message = 'Error occurred', status = 500, errors = null) => {
    return res.status(status).json({
        success: false,
        message,
        ...(errors && { errors })
    });
};
