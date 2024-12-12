import express from 'express'
import * as controller from '../controllers'
import { verifyAccessToken } from '../middleware/verifyToken';

const router = express.Router();


router.get('/chatHistory', verifyAccessToken,controller.chatHistory)
router.post('/addData', controller.updateData)
router.get('/getData', controller.getDataTrained)
router.get('/info', verifyAccessToken, controller.getUserInfo)
router.post('/update', verifyAccessToken, controller.updateUser)
router.get('/url', verifyAccessToken, controller.getAllUrls)



module.exports = router