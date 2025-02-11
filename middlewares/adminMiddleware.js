const jwt = require("jsonwebtoken");
require("dotenv").config();

const adminAuthenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(400).json({ error: "Missing token" });
    }

    const token = authHeader.split(" ")[1];
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
