const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

const resultController = require('../controllers/resultController');

router.get('/', authenticateToken, resultController.getResult);

module.exports = router;
