import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import asyncHandler from './async'
import ErrorResponse from '../Utils/errorResponse'
import { Model, Model as model } from 'mongoose'

import User from '../Models/User'

import { ProtectedRequest, IUserDocument, ITokenDecode } from '../Types'


export const protect = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1]

    if (!token)
      return next(new ErrorResponse('Please login first to use this feature', 401))

    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      let Model: typeof model = User

      const user = await Model.findById(
        (<ITokenDecode>decoded).id
      ).select('+password')

      if (!user) return next(new ErrorResponse('User Not found', 404))
      if (user.isDisabled)
        return next(
          new ErrorResponse(
            'This user is disabled please, connect admin for more details',
            404
          )
        )
      await user.save()
      delete user.password
      req.user = user

      next()
    } catch (err) {
      return next(new ErrorResponse('Please login first to use this feature', 401))
    }
  }
)
