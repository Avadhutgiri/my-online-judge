import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { adminApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    teams: 0,
    problems: 0,
    submissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, teamsRes, problemsRes, submissionsRes] = await Promise.all([
          adminApi.getAllUsers(),
          adminApi.getAllTeams(),
          adminApi.getAllProblems(),
          adminApi.getAllSubmissions(),
        ]);
        console.log(usersRes.data);
        console.log(teamsRes.data);
        console.log(problemsRes.data);
        console.log(submissionsRes.data);

        setStats({
          users: usersRes.data.length,
          teams: teamsRes.data.length,
          problems: problemsRes.data.length,
          submissions: submissionsRes.data.length,
        });
      } catch (err) {
        setError('Failed to fetch dashboard statistics');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value }) => (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 140,
        justifyContent: 'center',
      }}
    >
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {loading ? (
        <CircularProgress size={30} />
      ) : (
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value={stats.users} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Teams" value={stats.teams} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Problems" value={stats.problems} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Submissions" value={stats.submissions} />
        </Grid>
      </Grid>
    </Box>
  );
} 