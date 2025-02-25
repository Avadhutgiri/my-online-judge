const express = require("express");
require("dotenv").config();
const userController = require("../controllers/userController");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");


router.post('/register', userController.registerUser);


router.post("/login", userController.Login);

router.get('/profile', authenticateToken, userController.GetProfile);

router.post('/registerTeam', authenticateToken, userController.RegisterTeam);

module.exports = router;
