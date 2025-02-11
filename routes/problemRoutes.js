const express = require("express");
const { Problem } = require("../models");
const authenticateToken = require("../middlewares/authMiddleware");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const problemController = require("../controllers/problemController");

router.get("/", authenticateToken, problemController.getProblems );

router.get("/testcases/:problem_id", problemController.getTestCase);


module.exports = router;