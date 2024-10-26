import { Request, Response, NextFunction } from 'express'
import { Model, Model as model } from 'mongoose'
import ErrorResponse from '../Utils/errorResponse'
import asyncHandler from '../Middleware/async'
import bcrypt from 'bcryptjs'
import User from '../Models/User'
import { ProtectedRequest, IUserDocument } from '../Types'
import { sendTokenResponse } from 'Utils/auth'



export const register = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { firstName, email, password, userName } = req.body

    if (!password) return next(new ErrorResponse('Please provide password', 400))
    if (!email) return next(new ErrorResponse('Email required', 400))


    const emailExist: IUserDocument | null = await User.findOne({ email: email })
    if (emailExist) return next(new ErrorResponse('Email already exists', 400))

    await User.create({ userName, email, password })

    return res.status(200).json({
      success: true,
    })
  }
)


export const login = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    let Model: typeof model = User

    if (!email) return next(new ErrorResponse('Email required', 400))
    if (!password) return next(new ErrorResponse('password required', 400))


    // Check for user
    const user = await Model.findOne({ email }).select('+password')

    if (!user) return next(new ErrorResponse('User not found with this email', 404))

    if (user.isDisabled) return next(new ErrorResponse('This user is disabled please, connect admin for more details', 401))


    // Check if password is match
    const isMatch = await user.matchPassword(password)
    console.log(isMatch)
    if (!isMatch) return next(new ErrorResponse('Invalid Credentials', 401))


    sendTokenResponse(user, 200, res)
  }
)



export const getUserProfile = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {

    const user: IUserDocument | null = await User.findById({ _id: req.user._id })

    if (!user) return next(new ErrorResponse('User not found', 400))

    res.status(200).json({
      success: true,
      data: user,
    })

  })