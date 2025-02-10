const express = require("express");
const router = express.Router();
const { User, Problem, Submission } = require('../models');
const jwt = require('jsonwebtoken');
const leaderboardController = require('../controllers/leaderboardController');

function optionalAuthenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        req.user = null;  // No token, proceed as guest user
        return next();
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;  // Invalid token, proceed as guest
        } else {
            req.user = user;  // Valid token, user is authenticated
        }
        next();
    });
}

router.get('/', optionalAuthenticateToken, leaderboardController.getLeaderboard );

module.exports = router;
