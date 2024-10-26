import express from 'express'

import {register,getUserProfile,login} from '../Controllers/Auth'

import {protect } from '../Middleware/auth'

const router = express.Router()

router.route('/register').post(register)

router.route('/login').post(login)

router.route('/profile').get(protect,getUserProfile)


export default router;
