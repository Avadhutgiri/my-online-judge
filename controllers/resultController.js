const { User, Problem, Submission } = require('../models');

exports.getResult = async (req, res) => {
    try {
        const user_id = req.user.id;
        console.log(req.user);
        // Fetch user details
        const user = await User.findByPk(user_id, {
            attributes: ['username', 'score', 'correct_submission', 'wrong_submission', 'is_junior', 'event_name']
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { event_name, is_junior } = user;

        // Fetch problems for the user's event and category
        const problems = await Problem.findAll({
            where: { event_name, is_junior },
            attributes: ['id', 'score']
        });

        // Fetch all users for the leaderboard in the same event and category
        const users = await User.findAll({
            where: { event_name, is_junior },
            attributes: ['id', 'username', 'score', 'first_solve_time', 'wrong_submission']
        });

        // Sort the leaderboard (score descending, earliest solve time, fewer wrong submissions)
        users.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.first_solve_time && b.first_solve_time) return new Date(a.first_solve_time) - new Date(b.first_solve_time);
            return a.wrong_submission - b.wrong_submission;
        });

        // Find the user's rank
        const rank = users.findIndex(u => u.id === user_id) + 1;

        // Calculate accuracy
        const totalSubmissions = user.correct_submission + user.wrong_submission;
        const accuracy = totalSubmissions > 0 ? ((user.correct_submission / totalSubmissions) * 100).toFixed(2) : '0.00';

        // Response
        res.json({
            user: {
                id: user_id,
                username: user.username,
                total_score: user.score,
                correct_submission: user.correct_submission,
                wrong_submission: user.wrong_submission,
                accuracy: `${accuracy}%`,
                rank
            }
        });
    } catch (error) {
        console.error('Error fetching user result:', error);
        res.status(500).json({ error: 'Error fetching user data', details: error.message });
    }
}