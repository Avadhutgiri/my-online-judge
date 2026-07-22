const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const submissionController = require('../controllers/submissionController');
const validateSubmission = require('../middlewares/validateSubmission');


router.post('/run', authenticateToken, validateSubmission, submissionController.RunProblem);

router.post('/runSystem', authenticateToken, validateSubmission, submissionController.RunOnSystem);

router.post('/submit', authenticateToken, validateSubmission, submissionController.SubmitProblem);

router.get('/history', authenticateToken, submissionController.GetHistory)

router.get('/history/:problem_id', authenticateToken, submissionController.GetHistoryByProblem)
module.exports = router;
