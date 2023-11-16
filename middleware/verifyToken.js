const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { MONGO_DB_CONFIG } = require('../config/app.config');

const verifyToken = async (req, res, next) => {
    let token;
    const authHeader = req?.headers?.authorization?.startsWith("Bearer"); // gọi set token
    if (authHeader) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, MONGO_DB_CONFIG.JWT_SECRET);
                const user = await User.findById(decoded?.id);
                req.user = user;
                next();
            }
        } catch (error) {
            return res.status(403).json({ message: 'Invalid token' })

        }

    } else {
        return res.status(401).json({ message: 'you are not authenticated' })
    }
}

const isAdmin = async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (!adminUser || adminUser.isAdmin !== true) {
        res.status(500).json({ message: "You are not an admin", data: null });
    } else {
        next();
    }
}
module.exports = { verifyToken, isAdmin };