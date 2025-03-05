const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Problem = require('./Problem');  //  Import Problem model

const ProblemSample = sequelize.define('ProblemSample', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    problem_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    input: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    output: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true  // Optional field, make it mandatory if required
    }
}, {
    timestamps: false
});

module.exports = ProblemSample;
