import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IUserDocument } from '../Types/index'


const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      trim: true,
      index: true,
      lowercase: true,
      required: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    userName: {
      type: String,
      index: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      minlength: 8,
      required: true,
      select: false, // doing this will not return password when we get the usr from API
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.pre<IUserDocument>(
  'save',
  async function (this: IUserDocument, next) {
    if (!this.isModified('password')) next()

    if (this.password) {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
    }
  }
)


UserSchema.methods.getSignedJwtToken = function (this: IUserDocument) {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}



UserSchema.methods.matchPassword = async function (
  this: IUserDocument,
  enteredPassword: string
) {
  if (this.password) return await bcrypt.compare(enteredPassword, this.password)
  else return false
}


export default model<IUserDocument>('User', UserSchema)
