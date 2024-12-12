import express from 'express'
import * as controller from '../controllers'
import { verifyAccessToken } from '../middleware/verifyToken';

const router = express.Router();


router.post('/ask', verifyAccessToken, controller.askChatGPT)
router.post('/crawl', verifyAccessToken, controller.getInformationByUrl)



module.exports = router