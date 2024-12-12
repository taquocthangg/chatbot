import sendOtpToEmail from "../middleware/otp";
import { decryptOtp, generateOtpToken } from "../middleware/otpJwt";
import { generateAccessToken } from "../middleware/jwt";
import db from "../models";
import bcrypt from 'bcryptjs'
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(9))

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;


        if (!email || !password || !name) {
            return res.status(400).json({
                err: 1,
                mess: "Chưa nhập email, mật khẩu hoặc tên"
            });
        }

        const response = await db.User.findOrCreate({
            where: { email },
            defaults: {
                name,
                email,
                password: hashPassword(password),
            }
        });

        const otp = crypto.randomInt(100000, 999999).toString();


        const otpToken = generateOtpToken(otp, email);

        // Get current date for the OTP email content
        const date = new Date().toLocaleDateString();

        // If user is created, send OTP to email
        if (response[1]) {
            await sendOtpToEmail({
                email,
                otp,
                date,
                header: 'Xác nhận đăng ký',
                content: 'Sử dụng mã OTP dưới đây để hoàn tất việc đăng ký tài khoản. (Hiệu lực 5 phút từ khi bạn nhận được mail này)',
                support_email: 'hopitech@gmail.com',
                support_website: 'https://hopitech.xyz',
                footer_title: 'HOPITECH - Đặt khám trực tuyến',
                footer_address: '235 Hoàng Quốc Việt, TP. Hà Nội',
                footer_facebook: 'https://facebook.com',
                footer_insta: 'https://instagram.com',
                footer_twiter: 'https://twitter.com',
                footer_youtube: 'https://youtube.com',
                copyright: '© 2024 Công ty XYZ',
            });
        }


        return res.json({
            err: response[1] ? 0 : 1,
            mess: response[1] ? 'Đăng ký thành công. Vui lòng kiểm tra email để nhận OTP xác thực.' : "Tài khoản đã tồn tại.",
            otpToken: response[1] ? otpToken : null
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            err: -1,
            mess: "Lỗi server"
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ err: 1, mess: "Tài khoản chưa được đăng ký" });
        }

        if (!user.active) {
            return res.status(400).json({ err: 1, mess: "Tài khoản chưa xác minh email" });
        }

        const isChecked = bcrypt.compareSync(password, user.password);
        if (!isChecked) {
            return res.status(400).json({ err: 1, mess: "Mật khẩu sai" });
        }

        const token = generateAccessToken(user.id, user.role, user.email);
        return res.json({
            err: 0,
            mess: "Đăng nhập thành công",
            access_token: token,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ err: -1, mess: "Lỗi server" });
    }
};

export const verifyOtp = async (req, res) => {
    const { otp, otpToken } = req.body;
    try {
        const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
        const email = decoded.email;
        const encryptedOtp = decoded.otp;

        const originalOtp = decryptOtp(encryptedOtp);

        if (otp !== originalOtp) {
            return res.status(400).json({ err: 1, mess: "OTP không chính xác" });
        }

        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ err: 1, mess: "Người dùng không tồn tại" });
        }

        user.active = true;
        await user.save();

        return res.json({ err: 0, mess: "Xác minh OTP thành công, tài khoản đã được xác thực" });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ err: 1, mess: "OTP đã hết hạn" });
        }
        console.error(error);
        return res.status(500).json({ err: 1, mess: "OTP không hợp lệ hoặc có lỗi xảy ra" });
    }
};
let otpSentTimes = {};
export const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ err: 1, mess: "Người dùng không tồn tại" });
        }

        if (user.active) {
            return res.status(400).json({ err: 1, mess: "Email đã được xác minh" });
        }

        const now = Date.now();
        const lastSentTime = otpSentTimes[email];

        if (lastSentTime) {
            const timeElapsed = (now - lastSentTime) / 1000;
            if (timeElapsed < 60) {
                const timeRemaining = Math.ceil(60 - timeElapsed);
                return res.status(400).json({ err: 1, mess: `Vui lòng chờ ${timeRemaining} giây trước khi gửi lại OTP.` });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await sendOtpToEmail({
            email,
            otp,
            date: new Date().toLocaleString(),
            header: 'Xác nhận đăng ký',
            content: 'Sử dụng mã OTP dưới đây để hoàn tất việc đăng ký tài khoản.(Hiệu lực 5p từ khi bạn nhận được mail này)',
            support_email: 'hopitech@gmail.com',
            support_website: 'https://hopitech.xyz',
            footer_title: 'HOPITECH - Đặt khám trực tuyến',
            footer_address: '235 Hoàng Quốc Việt, TP. Hà Nội',
            footer_facebook: 'https://facebook.com',
            footer_insta: 'https://instagram.com',
            footer_twiter: 'https://twitter.com',
            footer_youtube: 'https://youtube.com',
            copyright: '© 2024 Công ty XYZ',
        });

        otpSentTimes[email] = now;
        const otpToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });

        return res.json({ err: 0, mess: "OTP đã được gửi lại thành công", otpToken });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: 1, mess: "Lỗi khi gửi lại OTP" });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ err: 1, mess: "Người dùng không tồn tại" });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const resetLink = `${process.env.URL_SERVER}api/v1/auth/reset-password/${token}`;
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Đặt lại mật khẩu',
            html: `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn. Link này sẽ hết hạn sau 15 phút kể từ bây giờ. ${resetLink}`
        });

        return res.json({ err: 0, mess: "Email đặt lại mật khẩu đã được gửi." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ err: 1, mess: "Lỗi khi gửi email đặt lại mật khẩu" });
    }
};


export const renderResetPasswordPage = (req, res) => {

    res.sendFile(__dirname + '/reset-password.html');
};

