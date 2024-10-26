import express from 'express'

import {sendMessage,getMessage} from '../Controllers/Message'

import {protect } from '../Middleware/auth'

const router = express.Router()


router.route('/:chatId/messages').post(protect,sendMessage)

router.route('/:chatId/messages').get(protect,getMessage)




export default router;
