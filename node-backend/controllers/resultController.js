const { Team, Problem, Submission, Event } = require('../models');

exports.getResult = async (req, res) => {
    try {
        const team_id = req.user.team_id;

        // Fetch team details
        const team = await Team.findByPk(team_id, {
            attributes: ['id', 'team_name', 'score', 'correct_submission', 'wrong_submission', 'is_junior', 'event_id', 'first_solve_time'],
            include: [{ model: Event, as: 'Event', attributes: ['name'] }]
        });

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const { event_id, is_junior } = team;

        // Fetch problems for the same event and category
        const problems = await Problem.findAll({
            where: { event_id, is_junior },
            attributes: ['id', 'score']
        });

        // Fetch all teams for this event and category
        const teams = await Team.findAll({
            where: { event_id, is_junior },
            attributes: ['id', 'team_name', 'score', 'correct_submission', 'wrong_submission', 'first_solve_time']
        });

        // Sort teams by total score, then earliest solve time, then fewer wrong submissions
        teams.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.first_solve_time && b.first_solve_time)
                return new Date(a.first_solve_time) - new Date(b.first_solve_time);
            return a.wrong_submission - b.wrong_submission;
        });

        // Compute team rank
        const rank = teams.findIndex(t => t.id === team_id) + 1;

        // Calculate accuracy
        const totalSubmissions = team.correct_submission + team.wrong_submission;
        const accuracy = totalSubmissions > 0 ? ((team.correct_submission / totalSubmissions) * 100).toFixed(2) : '0.00';

        // Response
        res.status(200).json({
            team: {
                id: team_id,
                team_name: team.team_name,
                total_score: team.score,
                event_id: team.event_id,
                event_name: team.Event.name,
                is_junior,
                correct_submission: team.correct_submission,
                wrong_submission: team.wrong_submission,
                accuracy: `${accuracy}%`,
                rank
            }
        });

    } catch (error) {
        console.error('Error fetching team result:', error);
        res.status(500).json({ error: 'Error fetching team data', details: error.message });
    }
};
