const express = require("express");
const { Problem } = require("../models");
const authenticateToken = require("../middlewares/authMiddleware");
const path = require("path");
const fs = require("fs");
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

router.get("/testcases/:problem_id", async (req, res) => {
  try {
    const { problem_id } = req.params;
    const problem = await Problem.findByPk(problem_id);

    if (!problem || !problem.test_case_path) {
      return res.status(404).json({ error: "Problem or test cases not found" });
    }

    const testCaseDir = path.join(__dirname, `..${problem.test_case_path}`);
    const files = fs.readdirSync(testCaseDir);

    const inputs = files.filter((file) => file.startsWith("input"));
    const outputs = files.filter((file) => file.startsWith("output"));

    res.json({ inputs, outputs });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching test cases", details: error.message });
  }
});


module.exports = router;