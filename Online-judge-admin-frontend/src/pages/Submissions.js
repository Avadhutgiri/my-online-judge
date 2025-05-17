import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { adminApi } from '../services/api';
import { formatDate } from '../utils/dateUtils';

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await adminApi.getAllSubmissions();
      setSubmissions(response.data);
    } catch (err) {
      setError('Failed to fetch submissions');
      console.error('Submissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'success';
      case 'wrong answer':
        return 'error';
      case 'time limit exceeded':
        return 'warning';
      case 'runtime error':
        return 'error';
      case 'compilation error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Submissions Management
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team</TableCell>
              <TableCell>Problem</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Memory</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.Team?.team_name || 'Unknown'}</TableCell>
                  <TableCell>{submission.Problem?.title || 'Unknown'}</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>
                    <Chip
                      label={submission.result}
                      color={getStatusColor(submission.result)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{submission.execution_time} ms</TableCell>
                  <TableCell>{submission.memory_usage} KB</TableCell>
                  <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {/* TODO: Implement view submission details */}}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 