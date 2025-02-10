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
require('dotenv').config();
    
const app = express();
app.use(express.json());  // To handle JSON payloads

const PORT = process.env.PORT || 5000;

// Sync database at server start (optional)
(async () => {
    await syncDB();
})();

// Basic route
app.get('/', (req, res) => {
    res.send('Online Judge API is running!');
});

app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});