import jwt from "jsonwebtoken";


// Xác minh OTP
export const verifyOtp = (otp, otpToken) => {
    try {
        // Giải mã JWT
        const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

        // Giải mã OTP từ token
        const encryptedOtp = decoded.otp;
        const originalOtp = decryptOtp(encryptedOtp);

        // So sánh OTP
        if (otp === originalOtp) {
            return { err: 0, mess: "Xác minh OTP thành công" };
        } else {
            return { err: 1, mess: "OTP không chính xác" };
        }
    } catch (error) {
        return { err: 1, mess: "OTP đã hết hạn hoặc không hợp lệ" };
    }
};
