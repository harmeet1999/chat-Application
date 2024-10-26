
import { Response, NextFunction } from 'express'

import {IUserDocument } from '../Types'

export const sendTokenResponse = async (
  user: IUserDocument ,
  statusCode: number,
  res: Response,

) => {
  await user.save()
  const token = user.getSignedJwtToken()
  res.status(statusCode).json({
    success: true,
    token
  })
}
