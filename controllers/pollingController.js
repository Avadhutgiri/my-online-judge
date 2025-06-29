const redisClient = require('../config/redisConfig');  // Import Redis client
const Submission = require('../models/Submission');

exports.getSubmission = async (req, res) => {
    try {
        const { submission_id } = req.params;

        // 🔍 Check Redis for temporary run results (like `run_171876221`)
        if (submission_id.startsWith('run_')) {
            const runResult = await redisClient.get(`run_result:${submission_id}`);
            if (!runResult) {
                return res.status(404).json({ error: 'Run request not found or expired' });
            }

            return res.status(200).json(JSON.parse(runResult));
        }

        // 📥 Check the database for permanent submission results
        const submission = await Submission.findByPk(submission_id, {
            attributes: ['id', 'result', 'execution_time', 'memory_usage', 'failed_test_case']
        });

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        return res.status(200).json({
            submission_id: submission.id,
            status: submission.result,
            failed_test_case: submission.failed_test_case,
            execution_time: submission.execution_time,
            memory_usage: submission.memory_usage
        });
    } catch (error) {
        console.error("Polling error:", error);
        return res.status(500).json({ error: 'Error fetching task status', details: error.message });
    }
}