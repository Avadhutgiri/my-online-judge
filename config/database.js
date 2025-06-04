const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine if running inside Docker or on VM
const isDocker = process.env.NODE_ENV === 'docker';

// Fallbacks for DB host and port
const DB_HOST = isDocker ? process.env.DB_HOST : process.env.LOCAL_DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_DIALECT = process.env.DB_DIALECT || 'postgres';

// Initialize Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: DB_HOST,
        port: DB_PORT,
        dialect: DB_DIALECT,
        logging: false, // Disable SQL logs in console
    }
);

// Optional test function for DB connection
const testDBConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log(` Connected to ${DB_DIALECT} DB at ${DB_HOST}:${DB_PORT}`);
    } catch (error) {
        console.error(' Unable to connect to the database:', error.message);
    }
};

module.exports = { sequelize, testDBConnection };
