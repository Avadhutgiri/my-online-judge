const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();
const pollingController = require('../controllers/pollingController');


router.get('/:submission_id', authenticateToken, pollingController.getSubmission );

module.exports = router;