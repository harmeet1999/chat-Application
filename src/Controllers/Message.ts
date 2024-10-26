import { Request, Response, NextFunction } from 'express'
import ErrorResponse from '../Utils/errorResponse'
import asyncHandler from '../Middleware/async'
import Chats from 'Models/Chats'
import { ProtectedRequest, IUserDocument, IChatDocument } from '../Types'
import Message from 'Models/Message'





export const sendMessage = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {

    const { content } = req.body;
    const { chatId } = req.params

    if (!content) return next(new ErrorResponse('Message content is required', 400))

    let chat = await Chats.findById(chatId).populate({
      path: 'participants',
      model: 'User',
    })
    chat = JSON.parse(JSON.stringify(chat))

    if (!chat || !chat.participants.some((e) => (typeof e !== 'string' && e?._id === String(req.user._id)))) return next(new ErrorResponse('Chat not found', 404))


    const message = await Message.create({
      chatId,
      senderId: req.user.id,
      content,
    });

    res.status(201).json({
      success: true,
      data: message
    })
  }
)


export const getMessage = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {

    const { chatId } = req.params;

    const { page = 1, limit = 10 } = req.query;

    const message = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit((Number(limit)));

    if (!message) return next(new ErrorResponse('Message not found', 400))

    res.status(200).json({
      success: true,
      data: message
    })


  }
)