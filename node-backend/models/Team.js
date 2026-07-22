const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Event = require('./Event');

const Team = sequelize.define('Team',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    team_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    user1_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user2_id: {
        type: DataTypes.INTEGER,
        allowNull: true  // Can be null for solo participants
    },
    event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Events',
          key: 'id'
        },
    },
    is_junior: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    correct_submission: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    wrong_submission: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    first_solve_time: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
},
{
    timestamps: false,
});

module.exports = Team;
