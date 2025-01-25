const { sequelize } = require('../config/database');
const User = require('./User');
const Problem = require('./Problem');
const Submission = require('./Submission');

// Define relationships AFTER model imports
User.hasMany(Submission, { foreignKey: 'user_id' });
Problem.hasMany(Submission, { foreignKey: 'problem_id' });
Submission.belongsTo(User, { foreignKey: 'user_id' });
Submission.belongsTo(Problem, { foreignKey: 'problem_id' });

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error("Error syncing database models:", error);
    }
};

module.exports = {
    User,
    Problem,
    Submission,
    syncDB
};
