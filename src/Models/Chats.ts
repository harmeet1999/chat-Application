import { Schema, model } from 'mongoose'

import { IUserDocument, IChatDocument } from '../Types/index'


const ChatSchema = new Schema<IChatDocument>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref:'User'
    }],
  },
  {
    timestamps: true,
  }
)

export default model<IChatDocument>('Chat', ChatSchema)
