const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Problem = require('./Problem');

const Submission = sequelize.define('Submission', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    problem_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Problem,
            key: 'id'
        }
    },
    code: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    language: {
        type: DataTypes.ENUM('C++', 'Python', 'Java'),
        allowNull: false
    },
    result: {
        type: DataTypes.ENUM('Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    execution_time: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    memory_usage: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0
    },
    submitted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false
});

// Define relationships
User.hasMany(Submission, { foreignKey: 'user_id' });
Problem.hasMany(Submission, { foreignKey: 'problem_id' });
Submission.belongsTo(User, { foreignKey: 'user_id' });
Submission.belongsTo(Problem, { foreignKey: 'problem_id' });

module.exports = Submission;
