import { Request, Response, NextFunction } from 'express'
import ErrorResponse from '../Utils/errorResponse'
import asyncHandler from '../Middleware/async'
import Chats from 'Models/Chats'
import { ProtectedRequest, IUserDocument, IChatDocument } from '../Types'
import Message from 'Models/Message'


export const newChat = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    const existingChat = await Chats.findOne({
      participants: { $all: [req.user.id, userId] }
    });

    if (existingChat) return next(new ErrorResponse('Chat already exists', 400))

    const chat = await Chats.create({ participants: [req.user.id, userId] });

    res.status(201).json({
      success: true,
      data: chat
    })

  })


export const allChats = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {

    const chats = await Chats.find({ participants: req.user.id }).populate({
      path: 'participants',
      model: 'User',
    })

    if (!chats) return next(new ErrorResponse('Chat already exists', 400))


    res.status(200).json({
      success: true,
      data: chats
    })
  }
)



export const chatById = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {

    let chat: IChatDocument | null = await Chats.findById(req.params.chatId).populate({
      path: 'participants',
      model: 'User',
    })

    chat = JSON.parse(JSON.stringify(chat))

    if (!chat || !chat.participants.some((e) => (typeof e !== 'string' && e?._id === String(req.user._id)))) return next(new ErrorResponse('Chat not found', 404))


    const messages = await Message.find({ chatId: req.params.chatId });

    if (!messages) return next(new ErrorResponse('messages not found', 400))

    res.status(200).json({
      success: true,
      data: { messages, chat }
    })
  })