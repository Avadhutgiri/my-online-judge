const { Sequelize } = require('sequelize');
require('dotenv').config();

const isDocker = process.env.NODE_ENV === 'docker';

// Determine the database host dynamically
const DB_HOST = isDocker ? process.env.DB_HOST : process.env.LOCAL_DB_HOST;

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: DB_HOST,
        dialect: process.env.DB_DIALECT || 'postgres',
        port: process.env.DB_PORT,
        logging: false,  // Disable logging for cleaner output
    }
);

const testDBConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, testDBConnection };
