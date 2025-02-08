const express = require('express');
const redisClient = require('../config/redisConfig');

const { Submission, Problem } = require('../models');
const authenticateToken = require('../middlewares/authMiddleware');
const { User } = require('../models');
const router = express.Router();


async function enqueueTask(queue, data) {
    try {
        // Encode the code and custom testcase to Base64
        data.code = Buffer.from(data.code).toString('base64');
        if (data.customTestcase) {
            data.customTestcase = Buffer.from(data.customTestcase).toString('base64');
        }

        // Push the task to Redis queue
        await redisClient.lPush(queue, JSON.stringify(data));
        console.log(`Task enqueued to ${queue} with submission_id: ${data.submission_id}`);
    } catch (error) {
        console.error(`Error enqueuing task to ${queue}:`, error);
    }
}
// Submit a solution

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { problem_id, code, language } = req.body;
        const user_id = req.user.id;  // Get logged-in user ID from token

        if(!user_id){
            return res.status(403).json({ error: 'Unauthorized' });
        }
        // Check if problem exists
        const problem = await Problem.findByPk(problem_id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const submission = await Submission.create({
            user_id,
            problem_id,
            code,
            language,
            result: 'Pending',  // Placeholder
            execution_time: 0,
            memory_usage: 0
        });

        res.status(201).json({
            message: 'Submission received!',
            submission_id: submission.id,
            result: submission.result
        });

    } 
    catch (error) {
        res.status(500).json({ error: 'Error submitting code', details: error.message });
    }
});

router.put('/:submission_id', authenticateToken, async (req, res) => {
    try {
        const submissionId = parseInt(req.params.submission_id);  // Ensure it's a number

        if (isNaN(submissionId)) {
            return res.status(400).json({ error: 'Invalid submission ID' });
        }

        const { result, execution_time, memory_usage } = req.body;

        const submission = await Submission.findByPk(submissionId);
        if (!submission) {
            return res.status(404).json({ error: `Submission with ID ${submissionId} not found` });
        }

        // Check if the user already has a correct submission for this problem
        const existingCorrectSubmission = await Submission.findOne({
            where: {
                user_id: submission.user_id,
                problem_id: submission.problem_id,
                result: 'Accepted'
            }
        });

        submission.result = result;
        submission.execution_time = execution_time;
        submission.memory_usage = memory_usage;
        await submission.save();

        const user = await User.findByPk(submission.user_id);
        
        if (result === 'Accepted') {
            if (!existingCorrectSubmission) {
                user.correct_submission += 1;
                user.score += 10;  // Increase score for correct submissions
            }
        } else {
            user.wrong_submission += 1;
        }

        await user.save();

        res.json({ message: 'Submission updated successfully', submission });
    } catch (error) {
        res.status(500).json({ error: 'Error updating submission', details: error.message });
    }
});

router.post('/run', authenticateToken, async (req, res) => {
    try {
        
        const { problem_id, code, customTestcase, language, event } = req.body;
        const user = req.user;
        // const problem = await Problem.findByPk(problem_id);
        // if (!problem) {
        //     return res.status(404).json({ error: 'Problem not found' });
        // }
        const runData = {
            submission_id: `run_${Date.now()}`,
            problem_id,
            user_id: user.user_id,
            code,
            customTestcase: customTestcase || null,
            language,
            event,
        };

        await enqueueTask('runQueue', runData);

        res.status(200).json({ message: 'Run request enqueued successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to enqueue run request.' });
    }
});

router.post('/submit', authenticateToken, async (req, res) => {
    try {
        const { problem_id, code, language } = req.body;
        const user_id = req.user.id;

        const problem = await Problem.findByPk(problem_id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const submission = await Submission.create({
            user_id,
            problem_id,
            code,
            language,
            result: 'Pending',
            execution_time: 0,
            memory_usage: 0
        });

        // console.log(code)

        const inputPath = `${problem.test_case_path}`;

        const SubmissionData = { 
            submission_id: submission.id,
            code,
            language,
            inputPath,
            problem_id,
        };

        // Pass all data to the worker queue
        await enqueueTask('submitQueue', SubmissionData);

        res.json({ message: 'Code submitted successfully, waiting for evaluation.', submission_id: submission.id, result: submission.result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error submitting code', details: error.message });
    }
});




router.get('/history', authenticateToken, async (req, res) => {
    try{
        const user_id = req.user.id;
        const submissions = await Submission.findAll({
            where: { user_id },
            include: [{ model: Problem, attributes:['title'] }],
            order: [['submitted_at', 'DESC']] 
        });
        res.json(submissions);        
    }
    catch (error){
        res.status(500).json({ error: 'Error fetching submission history', details: error.message });
    }
})

module.exports = router;
