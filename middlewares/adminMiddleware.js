const jwt = require("jsonwebtoken");
require("dotenv").config();

const adminAuthenticate = (req, res, next) => {
    if (!req.cookies || !req.cookies.token) {
        return res.status(403).json({ error: 'Access denied. No token provided.' });
    }

    const token = req.cookies.token;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Access only For Admins" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token", details: error.message });
    }
};

module.exports = adminAuthenticate;
