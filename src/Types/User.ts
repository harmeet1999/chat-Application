import { Document } from 'mongoose'

export interface IUser {
  email: string
  userName: string
  password: string
  isDisabled?: boolean
}

export interface IUserDocument extends IUser, Document {
  matchPassword(enteredPassword: string): boolean
  getSignedJwtToken(): string
}