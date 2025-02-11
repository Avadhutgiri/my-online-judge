const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const submissionController = require('../controllers/submissionController');


router.post('/run', authenticateToken, submissionController.RunProblem);

router.post('/submit', authenticateToken, submissionController.SubmitProblem);

router.get('/history', authenticateToken, submissionController.GetHistory)

module.exports = router;
