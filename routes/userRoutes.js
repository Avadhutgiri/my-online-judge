const express = require("express");
require("dotenv").config();
const userController = require("../controllers/userController");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");


router.post('/register', userController.registerUser);


router.post("/login", userController.loginUser);

router.get('/profile', authenticateToken, userController.GetProfile);

module.exports = router;
