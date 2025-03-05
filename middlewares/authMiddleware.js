const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    console.log("Cookies:", req?.cookies); // Debugging - Check if cookies are present

    if (!req.cookies || !req.cookies.token) {
        return res.status(403).json({ error: 'Access denied. No token provided.' });
    }

    const token = req.cookies.token;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); // Proceed to next middleware
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid token', details: error.message });
    }
};

module.exports = authenticateToken;
