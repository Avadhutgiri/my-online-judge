const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true,
        validate: {
            isEmail: true
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),  // Default roles
        defaultValue: 'user'
    },
    first_solve_time: {
        type: DataTypes.DATE,
        allowNull: true
    }
    ,
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    correct_submission: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    wrong_submission: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    is_junior: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    event_name: {
        type: DataTypes.ENUM('Reverse Coding', 'Clash'),
        allowNull: false
    }
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['username', 'event_name']
        },
        {
            unique: true,
            fields: ['email', 'event_name']
        }
    ]
});

module.exports = User;
