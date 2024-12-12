import express from 'express'
import * as controller from '../controllers'

const router = express.Router();


router.post('/login', controller.login)
router.post('/register', controller.register)
router.post('/forgot-password', controller.forgotPassword)
router.get('/reset-password/:token', controller.renderResetPasswordPage);
router.post('/verify', controller.verifyOtp)
router.post('/resend-otp', controller.resendOtp)



module.exports = router