import jwt from 'jsonwebtoken';

const generateAccessToken = (uid, role, email) => jwt.sign({ id: uid, role, email }, process.env.JWT_SECRET, { expiresIn: '15d' })
const generateRefreshToken = (uid) => jwt.sign({ id: uid }, process.env.JWT_SECRET, { expiresIn: '7d' })

module.exports = {
    generateAccessToken,
    generateRefreshToken
}