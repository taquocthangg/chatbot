import crypto from 'crypto';
import jwt from 'jsonwebtoken';



// Hàm mã hóa OTP
export const encryptOtp = (otp) => {
    const cipher = crypto.createCipher("aes-256-cbc", process.env.CRYPTO_SECRET);
    let encrypted = cipher.update(otp, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};
// Hàm giải mã OTP
export const decryptOtp = (encryptedOtp) => {
    const decipher = crypto.createDecipher("aes-256-cbc", process.env.CRYPTO_SECRET);
    let decrypted = decipher.update(encryptedOtp, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
// Hàm tạo JWT chứa OTP
export const generateOtpToken = (otp, email) => {
    // Mã hóa OTP trước khi lưu vào JWT
    const encryptedOtp = encryptOtp(otp);

    // Tạo JWT
    const token = jwt.sign(
        { email, otp: encryptedOtp },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
    );

    return token;
};
