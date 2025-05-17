const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Problem = sequelize.define('Problem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50
    },
    input_format: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    output_format: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    constraints: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    test_case_path: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_junior: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    event_name: {
        type: DataTypes.ENUM('Reverse Coding', 'Clash'),
        allowNull: false
    },
    time_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 2
    },
    memory_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 256
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false
});

module.exports = Problem;
