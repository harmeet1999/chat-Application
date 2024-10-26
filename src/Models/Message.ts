import { Schema, model } from 'mongoose'

import { IMessageDocument } from '../Types/index'

const MessageSchema = new Schema<IMessageDocument>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default model<IMessageDocument>('Message', MessageSchema)
