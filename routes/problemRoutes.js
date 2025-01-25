const express = require("express");
const { Problem } = require("../models");
const authenticateToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try{
        const { event_name, is_junior } = req.user;
        const problems = await Problem.findAll({
            where: {
                event_name,
                is_junior
            }
        });

        if (problems.length === 0) {
            return res.status(404).json({ error: "No problems found" });
        }

        res.json(problems);
    }
    catch(error){
        res.status(500).json({ error: 'Error Fetching problems', details : error.message });
    }
});

module.exports = router;