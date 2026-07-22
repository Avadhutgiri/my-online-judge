const express = require("express");
const router = express.Router();
const { User, Problem, Submission } = require('../models');
const jwt = require('jsonwebtoken');
const leaderboardController = require('../controllers/leaderboardController');

function optionalAuthenticateToken(req, res, next) {
    if (!req.cookies || !req.cookies.token) {
        req.user = null;  // No token, proceed as guest user
        return next();
    }

    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
}

router.get('/', optionalAuthenticateToken, leaderboardController.getLeaderboard );

module.exports = router;
