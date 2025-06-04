const { Team, Problem, Submission, Event } = require('../models');

exports.getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, page = 1, event_id, is_junior } = req.query;

        if (!event_id) {
            return res.status(400).json({ error: 'event_id is required' });
        }

        const event = await Event.findByPk(event_id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const isJunior = is_junior === 'true';

        // 🔹 Fetch all problems for this event and category
        const problems = await Problem.findAll({
            where: { event_id, is_junior: isJunior },
            attributes: ['id', 'title', 'score'],
            order: [['id', 'ASC']]
        });

        const problemColumns = problems.map((_, index) => `q${index + 1}`);

        // 🔹 Fetch teams for this event and category
        const teams = await Team.findAll({
            where: { event_id, is_junior: isJunior },
            attributes: ['id', 'team_name', 'score', 'correct_submission', 'wrong_submission', 'first_solve_time']
        });

        // 🔹 Fetch accepted submissions with their problem scores
        const submissions = await Submission.findAll({
            where: {
                result: 'Accepted',
                event_id
            },
            attributes: ['team_id', 'problem_id'],
            include: [{ model: Problem, attributes: ['score'], as: 'Problem' }]
        });

        // 🔹 Organize submissions by team and problem
        const submissionMap = {};
        submissions.forEach(sub => {
            if (!submissionMap[sub.team_id]) {
                submissionMap[sub.team_id] = {};
            }
            submissionMap[sub.team_id][sub.problem_id] = sub.Problem.score;
        });

        // 🔹 Build leaderboard entries
        const leaderboard = teams.map(team => {
            let totalScore = 0;
            const problemScores = {};

            problems.forEach((problem, index) => {
                const score = submissionMap[team.id]?.[problem.id] || 0;
                totalScore += score;
                problemScores[`q${index + 1}`] = score;
            });

            return {
                teamname: team.team_name,
                ...problemScores,
                total_score: totalScore,
                first_solve_time: team.first_solve_time || new Date(9999999999999)
            };
        });

        // 🔹 Sort leaderboard: total score → first solve time
        leaderboard.sort((a, b) => {
            if (b.total_score !== a.total_score) {
                return b.total_score - a.total_score;
            }
            return new Date(a.first_solve_time) - new Date(b.first_solve_time);
        });

        // 🔹 Paginate (optional)
        const paginated = leaderboard.slice((page - 1) * limit, page * limit);
        const rankedTeams = paginated.map((team, index) => ({
            rank: index + 1 + (page - 1) * limit,
            ...team
        }));

        // 🔹 Return full response
        res.status(200).json({
            event_name: event.name,
            event_id: event.id,
            problems,
            problem_columns: problemColumns,
            users: rankedTeams
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Error fetching leaderboard', details: error.message });
    }
};
