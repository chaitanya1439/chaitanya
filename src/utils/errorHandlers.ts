// utils/errorHandlers.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Define a custom error type for better error handling
interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Custom error interface for validation errors
interface CustomValidationError {
  param: string;
  msg: string;
}

// Handle validation errors
export const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorArray: CustomValidationError[] = errors.array().map((error: any) => ({
      param: error.param,
      msg: error.msg,
    }));

    res.status(400).json({ errors: errorArray });
    return false;
  }
  return true;
};

// Handle general error response
export const handleErrorResponse = (res: Response, error: CustomError): Response => {
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
