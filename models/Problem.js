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
    input_format: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    output_format: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    constraints: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    test_cases: {
        type: DataTypes.JSONB,
        allowNull: false
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
    }
}, {
    timestamps: false
});

module.exports = Problem;
