const { sequelize } = require('../config/database');
const User = require('./User');
const Team = require('./Team');
const Problem = require('./Problem');
const Submission = require('./Submission');
const ProblemSample = require('./ProblemSample');

// **Define Relationships AFTER loading models**
User.belongsTo(Team, { foreignKey: 'team_id', as: 'Team' });
Team.hasMany(User, { foreignKey: 'team_id', as: 'Users' });

Submission.belongsTo(Team, { foreignKey: 'team_id', as: 'Team' });
Team.hasMany(Submission, { foreignKey: 'team_id', as: 'Submissions' });

Submission.belongsTo(Problem, { foreignKey: 'problem_id', as: 'Problem' });
Problem.hasMany(Submission, { foreignKey: 'problem_id', as: 'Submissions' });

Problem.hasMany(ProblemSample, { foreignKey: 'problem_id', as: 'Samples' });
ProblemSample.belongsTo(Problem, { foreignKey: 'problem_id', as: 'Problem' });

const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error("Error syncing database models:", error);
    }
};

module.exports = {
    sequelize,
    User,
    Team,
    Problem,
    Submission,
    ProblemSample,
    syncDB
};
