
const { User, Problem, Submission } = require('../models');
const EVENT_NAME_MAP = {
    ReverseCoding: 'Reverse Coding',
    Clash: 'Clash'
};

exports.getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const event_key = req.query.event_name;
        const is_junior = req.query.is_junior === 'true';
        const event_name = EVENT_NAME_MAP[event_key];

        if (!event_name) {
            return res.status(400).json({ error: 'Invalid event name.' });
        }

        // Fetch all problems for the event and category, sorted by ID
        const problems = await Problem.findAll({
            where: { event_name, is_junior },
            attributes: ['id', 'title', 'score'],
            order: [['id', 'ASC']]
        });

        // Create fixed column names: q1, q2, ..., q6
        const problemColumns = problems.map((problem, index) => `q${index + 1}`);

        // Fetch user data with accepted submissions for these problems
        const users = await User.findAll({
            where: { event_name, is_junior },
            attributes: ['id', 'username'],
            include: [
                {
                    model: Submission,
                    attributes: ['problem_id', 'result'],
                    where: { result: 'Accepted' },
                    include: [{ model: Problem, attributes: ['score'] }]
                }
            ]
        });

        // Transform the data for problem-wise scores
        const leaderboard = users.map((user) => {
            let totalScore = 0;
            const problemScores = {};

            problems.forEach((problem, index) => {
                const submission = user.Submissions.find(sub => sub.problem_id === problem.id);
                const score = submission ? problem.score : 0;
                totalScore += score;
                problemScores[`q${index + 1}`] = score;  // Use `q1`, `q2`, etc.
            });

            return {
                username: user.username,
                ...problemScores,
                total_score: totalScore
            };
        });

        // Rank the users and add rank to the response
        leaderboard.sort((a, b) => b.total_score - a.total_score);
        const rankedUsers = leaderboard.map((user, index) => ({
            rank: index + 1 + (page - 1) * limit,
            ...user
        }));

        // Send both problem details and ranked users
        res.json({
            event_name,
            problems,                 
            problem_columns: problemColumns,  
            users: rankedUsers        
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Error fetching leaderboard', details: error.message });
    }
}