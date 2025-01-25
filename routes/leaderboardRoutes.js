const express = require("express");
const { User } = require("../models");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try 
    {
        let { event_name, is_junior } = req.user;
        let { limit = 10, page = 1 } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);
        const offset = (page - 1) * limit;

        const leaderboard = await User.findAndCountAll({
        where: { event_name, is_junior },
        attributes: [
            "username",
            "score",
            "correct_submission",
            "wrong_submission",
        ],
        order: [
            ["score", "DESC"],
            ["correct_submission", "DESC"],
            ["wrong_submission", "ASC"],
        ],
        limit,
        offset,
        });
        res.json({
        totalUsers: leaderboard.count,
        totalPages: Math.ceil(leaderboard.count / limit),
        currentPage: page,
        data: leaderboard.rows,
        });
    } 
    catch (error) 
    {
        res
        .status(500)
        .json({ error: "Error Fetching leaderboard", details: error.message });
    }
});

module.exports = router;
