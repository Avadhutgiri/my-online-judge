const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(400).json({ error: 'Missing token' });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ error: 'Invalid token format. Use "Bearer <token>"' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(400).json({ error: 'Token not provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid token', details: error.message });
    }
};


module.exports = authenticateToken;
