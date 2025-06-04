const { Team, Problem, Submission } = require('../models');
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

        // 🔹 Fetch all problems for the event and category, sorted by ID
        const problems = await Problem.findAll({
            where: { event_name, is_junior },
            attributes: ['id', 'title', 'score'],
            order: [['id', 'ASC']]
        });

        // 🔹 Create fixed column names: q1, q2, ..., q6
        const problemColumns = problems.map((_, index) => `q${index + 1}`);

        // 🔹 Fetch teams participating in the event
        const teams = await Team.findAll({
            where: { event_name, is_junior },
            attributes: ['id', 'team_name', 'score', 'correct_submission', 'wrong_submission', 'first_solve_time']
        });

        // 🔹 Fetch all accepted submissions at once (✅ FIX: Using `as: 'Problem'`)
        const submissions = await Submission.findAll({
            where: { result: 'Accepted' },
            attributes: ['team_id', 'problem_id'],
            include: [{ model: Problem, attributes: ['score'], as: 'Problem' }]  // ✅ FIXED alias issue
        });

        // 🔹 Index submissions by team ID for **faster lookup**
        const submissionMap = {};
        submissions.forEach(sub => {
            if (!submissionMap[sub.team_id]) {
                submissionMap[sub.team_id] = {};
            }
            submissionMap[sub.team_id][sub.problem_id] = sub.Problem.score;
        });

        // 🔹 Transform data for problem-wise scores
        const leaderboard = teams.map((team) => {
            let totalScore = 0;
            const problemScores = {};

            problems.forEach((problem, index) => {
                const score = submissionMap[team.id]?.[problem.id] || 0;
                totalScore += score;
                problemScores[`q${index + 1}`] = score;  // Ensuring q1, q2, ..., q6
            });

            return {
                teamname: team.team_name,
                ...problemScores,
                total_score: totalScore,
                first_solve_time: team.first_solve_time || new Date(9999999999999) // Default large value if missing
            };
        });

        // 🔹 Rank teams with **tie-breaker logic**
        leaderboard.sort((a, b) => {
            if (b.total_score !== a.total_score) {
                return b.total_score - a.total_score;  // **Sort by total score first**
            }
            return new Date(a.first_solve_time) - new Date(b.first_solve_time); // **Tie-breaker: First Solve Time**
        });

        const rankedTeams = leaderboard.map((team, index) => ({
            rank: index + 1 + (page - 1) * limit,
            ...team
        }));

        // 🔹 Send **both** problem details & ranked users
        res.status(200).json({
            event_name,
            problems,
            problem_columns: problemColumns,
            users: rankedTeams
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Error fetching leaderboard', details: error.message });
    }
};
