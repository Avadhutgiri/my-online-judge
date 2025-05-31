const redisClient = require('../config/redisConfig');

const { Submission, Problem } = require('../models');

const axios = require('axios');
const CELERY_API_BASE = 'http://celery-api:8000';

async function enqueueTask(queue, data) {
    try {
        if (data.code)
            data.code = Buffer.from(data.code).toString('base64');
        if (data.customTestcase)
            data.customTestcase = Buffer.from(data.customTestcase).toString('base64');

        let endpoint = '';
        if (queue === 'submitQueue') endpoint = '/enqueue/submit';
        else if (queue === 'runQueue') endpoint = '/enqueue/run';
        else if (queue === 'runSystemQueue') endpoint = '/enqueue/system';

        const res = await axios.post(`${CELERY_API_BASE}${endpoint}`, data);
        // console.log(`Enqueued via Flask: ${res.data.message}`);
    } catch (error) {
        console.error(`Error enqueueing via Flask API:`, error.message);
    }
}


exports.SubmitProblem = async (req, res) => {
    try {
        const { problem_id, code, language } = req.body;
        const team_id = req.user.team_id;

        const problem = await Problem.findByPk(problem_id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        if (req.user.event_name !== problem.event_name) {
            return res.status(403).json({
                error: 'You are not authorized to submit a solution for this problem.',
                details: `Expected event: ${req.user.event_name}, Problem event: ${problem.event_name}`
            });
        }
        const submission = await Submission.create({
            team_id,
            problem_id,
            code,
            language,
            result: 'Pending',
            execution_time: 0,
            memory_usage: 0
        });


        const inputPath = `${problem.test_case_path}`;

        const SubmissionData = {
            submission_id: submission.id,
            code,
            language,
            inputPath,
            problem_id,
        };

        await enqueueTask('submitQueue', SubmissionData);

        res.json({ message: 'Code submitted successfully, waiting for evaluation.', submission_id: submission.id, result: submission.result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error submitting code', details: error.message });
    }
}
exports.RunProblem = async (req, res) => {
    try {

        const { problem_id, code, customTestcase, language, event } = req.body;
        const user = req.user;
        const problem = await Problem.findByPk(problem_id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }


        if (req.user.event_name !== problem.event_name) {
            return res.status(403).json({
                error: 'You are not authorized to submit a solution for this problem.',
                details: `Expected event: ${req.user.event_name}, Problem event: ${problem.event_name}`
            });
        }
        const submission_id= `run_${Date.now()}`;

        const runData = {
            submission_id: submission_id,
            problem_id,
            team_id: user.team_id,
            code,
            customTestcase: customTestcase || null,
            language,
            event,
        };


        await enqueueTask('runQueue', runData);

        res.status(200).json({ message: `Run request enqueued successfully.`,submission_id: submission_id });
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to enqueue run request.' });
    }   
}

exports.RunOnSystem = async (req, res) => {
    try{
        const { problem_id, customTestcase } = req.body;

        const problem = await Problem.findByPk(problem_id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const submission_id= `run_${Date.now()}`;

        const runData = {
            submission_id: submission_id,
            problem_id,
            customTestcase: customTestcase || null,
        };

        await enqueueTask('runSystemQueue', runData);

        res.status(200).json({ message: `Run request enqueued successfully.`,submission_id: submission_id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to enqueue run request.' });
    }
}

exports.GetHistory = async (req, res) => {
    try {
        const team_id = req.user.team_id;
        const submissions = await Submission.findAll({
            where: { team_id },
            include: [{ model: Problem, attributes: ['title'], as: 'Problem' }],
            order: [['submitted_at', 'DESC']]
        });
        res.json(submissions);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching submission history', details: error.message });
    }
}

exports.GetHistoryByProblem = async (req, res) => {
    try{
        const team_id = req.user.team_id;
        const submissions = await Submission.findAll({
            where: { team_id, problem_id: req.params.problem_id },
            include: [{ model: Problem, attributes: ['title'], as: 'Problem' }],
            order: [['submitted_at', 'DESC']]
        });
        res.json(submissions);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching submission history', details: error.message });
    }
}