require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secretKey = process.env.JWT_SECRET_KEY;

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "You must be logged in" });
    }
    const token = authorization.replace("Bearer ", "")?.trim();
    jwt.verify(token, secretKey, async(err, payload) => {
        if (err) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        try {
            const { _id } = payload;
            const userData = await User.findById(_id);
            if (!userData) {
                return res.status(404).json({ error: "User not found" });
            }
            req.user = userData;
            next();
        } catch (err) {
            res.status(500).json({ error: "Server error", details: err.message });
        }
    });
};