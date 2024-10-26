import { Document } from 'mongoose'
import { IUserDocument, IChatDocument } from './'


export interface IMessage {
  chatId: IChatDocument | null | string
  senderId: IUserDocument | null | string
  content: string

}

export interface IMessageDocument extends IMessage, Document {
}