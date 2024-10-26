import { Request, Response, NextFunction } from 'express'

import { statusResponse } from 'Utils/statusTypes'
import ErrorResponse from 'Utils/errorResponse'

const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = statusResponse

const errorHandeler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: ErrorResponse = { ...err }

  error.message = err.message


  if (err.name) console.log(err.name.red.bold)


  console.error(err)


  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`
    error = new ErrorResponse(message, NOT_FOUND)
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered'
    error = new ErrorResponse(message, BAD_REQUEST)
  }


  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      // @ts-ignore
      .map((val) => val.message)
      .join(' && ')
    error = new ErrorResponse(message, BAD_REQUEST)
  }

  res
    .status(error.statusCode || INTERNAL_SERVER_ERROR)
    .json({ success: false, error: error.message || 'Server Error' })
}

export default errorHandeler
