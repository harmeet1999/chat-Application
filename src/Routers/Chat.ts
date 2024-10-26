import express from 'express'

import {newChat,allChats,chatById} from '../Controllers/Chat'

import {protect } from '../Middleware/auth'

const router = express.Router()


router.route('/').post(protect,newChat)

router.route('/').get(protect,allChats)

router.route('/:chatId').get(protect,chatById)



export default router;
