const express = require('express');
const userRoutes = require('./routes/userRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes')
const authenticateToken = require('./middlewares/authMiddleware');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webHookRoutes = require('./routes/webHookRoutes');
const pollingRoutes = require('./routes/pollingRoutes');
const resultRoutes = require('./routes/resultRoutes');
const { syncDB } = require('./models');
const cookieParser = require('cookie-parser');
const http = require('http');
const { initSocket } = require('./socketService');
require('dotenv').config();

const app = express();
app.use(express.json());  // To handle JSON payloads
app.use(cookieParser())
const PORT = process.env.PORT || 5000;
const cors = require("cors");

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
? process.env.ALLOWED_ORIGINS.split(',') 
: ["http://localhost:5173", "http://localhost:3000"];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true, // Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
};

const server = http.createServer(app);

app.use(cors(corsOptions));

// Sync database at server start (optional)
(async () => {
    await syncDB();
})();

// Set CORS TO public

// Basic route
app.get('/', (req, res) => {
    res.send('Online Judge API is running!');
});

app.get('/api/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Access granted', user: req.user });
});

app.get('/api/users/verify', authenticateToken, (req, res) => {
    res.status(200).json({ authenticated: true, user: req.user });
  });


// Start the server
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);


app.use('/webhook', webHookRoutes);
app.use('/polling', pollingRoutes);
app.use('/result', resultRoutes);


initSocket(server,{
    cors: {
        origin: allowedOrigins,
        credentials: true,
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
