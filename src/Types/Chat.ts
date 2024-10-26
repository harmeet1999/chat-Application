import { Document } from 'mongoose'
import { IUserDocument } from './'


export interface IChat {
  participants: [IUserDocument | null | string]
}

export interface IChatDocument extends IChat, Document {
}