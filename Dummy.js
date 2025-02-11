const { sequelize } = require('./config/database');  // Adjust the path based on your project structure
const Sequelize = require('sequelize');              // Correctly import Sequelize package

const { User, Problem, Submission } = require('./models');
const bcrypt = require('bcryptjs');
const { Op } = Sequelize;


async function seedDummyData() {
    try {
        // Sync the models with the database (create tables if they don't exist)
        await sequelize.sync({ force: true });  // WARNING: This will drop and recreate tables!

        const hashedPassword = await bcrypt.hash("password123", 10);
        
        await User.bulkCreate([
            { id: 1, email: "email1@gmail.com", username: "JuniorCoder1", event_name: "Reverse Coding", is_junior: true, password: hashedPassword },
            { id: 2, email: "email2@gmail.com", username: "JuniorCoder2", event_name: "Reverse Coding", is_junior: true, password: hashedPassword },
            { id: 3, email: "email3@gmail.com", username: "SeniorSolver1", event_name: "Reverse Coding", is_junior: false, password: hashedPassword },
            { id: 4, email: "email4@gmail.com", username: "SeniorSolver2", event_name: "Reverse Coding", is_junior: false, password: hashedPassword },
            { id: 5, email: "email5@gmail.com", username: "ClashJunior1", event_name: "Clash", is_junior: true, password: hashedPassword },
            { id: 6, email: "email6@gmail.com", username: "ClashJunior2", event_name: "Clash", is_junior: true, password: hashedPassword },
            { id: 7, email: "email7@gmail.com", username: "ClashMaster1", event_name: "Clash", is_junior: false, password: hashedPassword },
            { id: 8, email: "email8@gmail.com", username: "ClashMaster2", event_name: "Clash", is_junior: false, password: hashedPassword }
        ]);

        // Insert problems
        await Problem.bulkCreate([
            { id: 1, title: "RC Junior Problem 1", event_name: "Reverse Coding", is_junior: true, score: 50 },
            { id: 2, title: "RC Junior Problem 2", event_name: "Reverse Coding", is_junior: true, score: 60 },
            { id: 3, title: "RC Senior Problem 1", event_name: "Reverse Coding", is_junior: false, score: 70 },
            { id: 4, title: "RC Senior Problem 2", event_name: "Reverse Coding", is_junior: false, score: 80 },
            { id: 5, title: "Clash Junior Problem 1", event_name: "Clash", is_junior: true, score: 50 },
            { id: 6, title: "Clash Junior Problem 2", event_name: "Clash", is_junior: true, score: 60 },
            { id: 7, title: "Clash Senior Problem 1", event_name: "Clash", is_junior: false, score: 100 },
            { id: 8, title: "Clash Senior Problem 2", event_name: "Clash", is_junior: false, score: 120 }
        ]);

        // Insert submissions
        await Submission.bulkCreate([
            // Junior RC event
            { user_id: 1, code: "abcd", language: "cpp", problem_id: 1, result: 'Accepted' },
            { user_id: 1, code: "abcd", language: "cpp", problem_id: 2, result: 'Accepted' },
            { user_id: 2, code: "abcd", language: "cpp", problem_id: 1, result: 'Wrong Answer' },

            // Senior RC event
            { user_id: 3, code: "abcd", language: "cpp", problem_id: 3, result: 'Accepted' },
            { user_id: 4, code: "abcd", language: "cpp", problem_id: 4, result: 'Accepted' },
            { user_id: 3, code: "abcd", language: "cpp", problem_id: 4, result: 'Wrong Answer' },

            // Junior Clash event
            { user_id: 5, code: "abcd", language: "cpp", problem_id: 5, result: 'Accepted' },
            { user_id: 5, code: "abcd", language: "cpp", problem_id: 6, result: 'Wrong Answer' },
            { user_id: 6, code: "abcd", language: "cpp", problem_id: 6, result: 'Accepted' },

            // Senior Clash event
            { user_id: 7, code: "abcd", language: "cpp", problem_id: 7, result: 'Accepted' },
            { user_id: 8, code: "abcd", language: "cpp", problem_id: 8, result: 'Accepted' },
            { user_id: 8, code: "abcd", language: "cpp", problem_id: 7, result: 'Wrong Answer' }
        ]);

        // Update user stats based on submissions
        const users = await User.findAll();
        for (const user of users) {
            const correctCount = await Submission.count({ where: { user_id: user.id, result: 'Accepted' } });
            const wrongCount = await Submission.count({ where: { user_id: user.id, result: { [Op.not]: 'Accepted' } } });
            const totalScore = await Submission.sum('Problem.score', {
                where: { user_id: user.id, result: 'Accepted' },
                include: [{ model: Problem, attributes: [] }]  // Remove extra attributes from the query
            });
            

            // Update the user record
            user.correct_submission = correctCount;
            user.wrong_submission = wrongCount;
            user.score = totalScore || 0;
            await user.save();
        }

        console.log("Dummy data inserted successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error inserting dummy data:", error);
        process.exit(1);
    }
}

seedDummyData();