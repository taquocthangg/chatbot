const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Mapping mã role với tên role
const roleNames = {
    R1: 'Admin',
    R2: 'Hospital',
    R3: 'Doctor',
    R4: 'User'
};

// xác thực token
const verifyAccessToken = asyncHandler(async (req, res, next) => {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) return res.status(401).json({
                err: 1,
                mess: 'Invalid access token'
            });
            req.user = decode;
            next();
        });
    } else {
        return res.status(401).json({
            err: 1,
            mess: 'Require authentication!!!'
        });
    }
});

// kiểm tra role
const requireRole = (role) => asyncHandler((req, res, next) => {
    const { role } = req.user;
    if (role !== role) {
        return res.status(401).json({
            err: 1,
            mess: `REQUIRE ${roleNames[role]} ROLE`
        });
    }
    next();
});

// xác thực user k có quyền (R4)
const notUser = asyncHandler((req, res, next) => {
    const { role } = req.user;
    if (role === 'R4') {
        return res.status(401).json({
            err: 1,
            mess: 'REQUIRE NON ADMIN ROLE'
        });
    }
    next();
});

module.exports = {
    verifyAccessToken,
    isAdmin: requireRole('R1'),
    isHospital: requireRole('R2'),
    isDoctor: requireRole('R3'),
    notUser
};
