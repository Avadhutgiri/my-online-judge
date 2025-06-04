// middlewares/validateSubmissionWindow.js
const { Problem, Event } = require('../models');

module.exports = async function validateSubmissionWindow(req, res, next) {
    try {
        const { problem_id } = req.body;
        const user_event_id = req.user.event_id;
        if (!problem_id) {
            return res.status(400).json({ error: 'problem_id is required' });
        }

        const problem = await Problem.findByPk(problem_id, { include: 'Event' });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        if (!problem.Event) {
            return res.status(500).json({ error: 'Problem has no associated event' });
        }

        const event = problem.Event;

        // Check if the user is from the same event
        if (problem.event_id !== user_event_id) {
            return res.status(403).json({
                error: 'Unauthorized: This problem does not belong to your event',
                details: `Your Event ID: ${user_event_id}, Problem Event ID: ${problem.event_id}`
            });
        }

        const now = new Date();
        if (!event.start_time || now < event.start_time) {
            return res.status(403).json({ error: 'Event has not started yet' });
        }

        if (event.end_time && now > event.end_time) {
            return res.status(403).json({ error: 'Event has already ended' });
        }

        req.problem = problem;
        req.event = event;

        next();

    } catch (error) {
        console.error('Submission middleware error:', error);
        return res.status(500).json({ error: 'Error validating submission window', details: error.message });
    }
};
