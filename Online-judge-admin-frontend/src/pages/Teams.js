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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { adminApi } from '../services/api';
import { formatDate } from '../utils/dateUtils';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await adminApi.getAllTeams();
      setTeams(response.data.teams);
    } catch (err) {
      setError('Failed to fetch teams');
      console.error('Teams error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await adminApi.deleteTeam(teamId);
        setTeams(teams.filter(team => team.id !== teamId));
      } catch (err) {
        setError('Failed to delete team');
        console.error('Delete team error:', err);
      }
    }
  };

  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedTeam(null);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teams Management
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
              <TableCell>Team Name</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Submissions</TableCell>
              <TableCell>First Solve</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No teams found
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow 
                  key={team.id}
                  hover
                  onClick={() => handleViewTeam(team)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{team.team_name}</TableCell>
                  <TableCell>{team.event_name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={team.is_junior ? "Junior" : "Senior"} 
                      color={team.is_junior ? "primary" : "secondary"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{team.score || 0}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${team.correct_submission || 0}/${team.wrong_submission || 0}`}
                      color={team.correct_submission > 0 ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {team.first_solve_time ? formatDate(team.first_solve_time) : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTeam(team);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Team">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTeam(team.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDetailsDialog} 
        onClose={handleCloseDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Team Details
        </DialogTitle>
        <DialogContent>
          {selectedTeam && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedTeam.team_name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Event: {selectedTeam.event_name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Category: {selectedTeam.is_junior ? "Junior" : "Senior"}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Score: {selectedTeam.score || 0}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Submissions: {selectedTeam.correct_submission || 0} correct, {selectedTeam.wrong_submission || 0} wrong
              </Typography>
              {selectedTeam.first_solve_time && (
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  First Solve: {formatDate(selectedTeam.first_solve_time)}
                </Typography>
              )}
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Team Members
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {selectedTeam.Users?.map((user) => (
                  <Paper key={user.id} sx={{ p: 2, minWidth: 200 }}>
                    <Typography variant="subtitle1">
                      {user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 