import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const sendOtpToEmail = async ({ email, otp, date, header, content, support_email, support_website, footer_title, footer_address, footer_facebook, footer_insta, footer_twiter, footer_youtube, copyright }) => {

    const templatePath = path.resolve(__dirname, 'otp.html');
    const template = fs.readFileSync(templatePath, 'utf8');


    const htmlContent = template
        .replace(/{{title}}/g, 'Mã OTP Xác Thực')
        .replace(/{{date}}/g, date)
        .replace(/{{header}}/g, header)
        .replace(/{{content}}/g, content)
        .replace(/{{OTP_Code}}/g, otp)
        .replace(/{{support_email}}/g, support_email)
        .replace(/{{support_website}}/g, support_website)
        .replace(/{{footer_title}}/g, footer_title)
        .replace(/{{footer_address}}/g, footer_address)
        .replace(/{{footer_facebook}}/g, footer_facebook)
        .replace(/{{footer_insta}}/g, footer_insta)
        .replace(/{{footer_twiter}}/g, footer_twiter)
        .replace(/{{footer_youtube}}/g, footer_youtube)
        .replace(/{{copyright}}/g, copyright);

    // Tạo cấu hình gửi email
     const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Mã OTP Xác Thực',
        html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
};

export default sendOtpToEmail;


