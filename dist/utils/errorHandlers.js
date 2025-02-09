"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrorResponse = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
// Handle validation errors
const handleValidationErrors = (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorArray = errors.array().map((error) => ({
            param: error.param,
            msg: error.msg,
        }));
        res.status(400).json({ errors: errorArray });
        return false;
    }
    return true;
};
exports.handleValidationErrors = handleValidationErrors;
// Handle general error response
const handleErrorResponse = (res, error) => {
    // Log the error with detailed information
    console.error({
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode || 500,
    });
    // Determine the status code to use in the response
    const statusCode = error.statusCode || 500;
    // Provide a more detailed response for operational errors, otherwise use a generic message
    const errorResponse = {
        status: 'error',
        message: error.isOperational ? error.message : 'Internal Server Error',
    };
    return res.status(statusCode).json(errorResponse);
};
exports.handleErrorResponse = handleErrorResponse;
