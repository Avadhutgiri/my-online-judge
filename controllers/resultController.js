const e = require('express');
const { Team, Problem, Submission } = require('../models');

exports.getResult = async (req, res) => {
    try {
        const team_id = req.user.team_id;
        console.log(req.user);
        // Fetch team details
        const team = await Team.findByPk(team_id, {
            attributes: ['team_name', 'score', 'correct_submission', 'wrong_submission', 'is_junior', 'event_name']
        });

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const { event_name, is_junior } = team;

        // Fetch problems for the Team's event and category
        const problems = await Problem.findAll({
            where: { event_name, is_junior },
            attributes: ['id', 'score']
        });

        // Fetch all Teams for the leaderboard in the same event and category
        const teams = await Team.findAll({
            where: { event_name, is_junior },
            attributes: ['id', 'team_name', 'score', 'correct_submission', 'wrong_submission', 'first_solve_time']
        });

        // Sort the leaderboard (score descending, earliest solve time, fewer wrong submissions)
        teams.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.first_solve_time && b.first_solve_time) return new Date(a.first_solve_time) - new Date(b.first_solve_time);
            return a.wrong_submission - b.wrong_submission;
        });

        // Find the Team's rank
        const rank = teams.findIndex(t => t.id === team_id) + 1;


        // Calculate accuracy
        const totalSubmissions = team.correct_submission + team.wrong_submission;
        const accuracy = totalSubmissions > 0 ? ((team.correct_submission / totalSubmissions) * 100).toFixed(2) : '0.00';

        // Response
        res.json({
            team: {
                id: team_id,
                team_name: team.team_name,
                total_score: team.score,
                event_name,
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
}