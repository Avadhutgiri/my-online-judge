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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Upload as UploadIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { adminApi } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openTestCasesDialog, setOpenTestCasesDialog] = useState(false);
  const [openSolutionDialog, setOpenSolutionDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problemDetails, setProblemDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    score: 0,
    input_format: '',
    output_format: '',
    constraints: '',
    // test_case_path: '',
    is_junior: false,
    event_name: '',
    time_limit: 1000,
    memory_limit: 256,
    samples: [{ input: '', output: '', explanation: '' }],
  });
  const [activeTab, setActiveTab] = useState(0);
  const [testCaseFiles, setTestCaseFiles] = useState([]);
  const [solutionFiles, setSolutionFiles] = useState([]);

  useEffect(() => {
    fetchProblems();
  }, []);


  const fetchProblems = async () => {
    try {
      const response = await adminApi.getAllProblems();
      setProblems(response.data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error('Problems error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = async (problem = null) => {
    if (problem) {
      setSelectedProblem(problem);
      try {
        // Fetch complete problem details
        const response = await adminApi.getProblemById(problem.id);
        const problemData = response.data;
        
        setFormData({
          id: problemData.id,
          title: problemData.title,
          description: problemData.description,
          score: problemData.score,
          input_format: problemData.input_format,
          output_format: problemData.output_format,
          constraints: problemData.constraints,
          is_junior: problemData.is_junior,
          event_name: problemData.event_name,
          time_limit: problemData.time_limit,
          memory_limit: problemData.memory_limit,
          samples: problemData.samples || [{ input: '', output: '', explanation: '' }],
        });
      } catch (err) {
        setError('Failed to fetch problem details');
        console.error('Fetch problem details error:', err);
        return;
      }
    } else {
      setSelectedProblem(null);
      setFormData({
        id: '',
        title: '',
        description: '',
        score: 0,
        input_format: '',
        output_format: '',
        constraints: '',
        is_junior: false,
        event_name: '',
        time_limit: 1000,
        memory_limit: 256,
        samples: [{ input: '', output: '', explanation: '' }],
      });
    }
    setOpenDialog(true);
  };

  const handleOpenTestCasesDialog = (problem) => {
    console.log('Opening test cases dialog for problem:', problem);
    setSelectedProblem(problem);
    setTestCaseFiles([]);
    setOpenTestCasesDialog(true);
  };

  const handleOpenSolutionDialog = (problem) => {
    setSelectedProblem(problem);
    setSolutionFiles([]);
    setOpenSolutionDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProblem(null);
  };

  const handleCloseTestCasesDialog = () => {
    setOpenTestCasesDialog(false);
    setSelectedProblem(null);
    setTestCaseFiles([]);
  };

  const handleCloseSolutionDialog = () => {
    setOpenSolutionDialog(false);
    setSelectedProblem(null);
    setSolutionFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert form data to proper format
      const problemData = {
        ...formData,
        score: parseInt(formData.score),
        time_limit: parseInt(formData.time_limit),
        memory_limit: parseInt(formData.memory_limit),
        is_junior: formData.is_junior === 'true',
        samples: formData.samples.map(sample => ({
          input: sample.input,
          output: sample.output,
          explanation: sample.explanation || ''
        }))
      };

      if (selectedProblem) {
        await adminApi.updateProblem(selectedProblem.id, problemData);
      } else {
        await adminApi.addProblem(problemData);
      }
      fetchProblems();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save problem');
      console.error('Save problem error:', err);
    }
  };

  const handleTestCasesSubmit = async () => {
    try {
      console.log('Selected Problem:', selectedProblem);
      const formData = new FormData();
      const problemId = selectedProblem.id || selectedProblem._id;
      console.log('Using problem ID:', problemId);
      formData.append('problem_id', problemId);
      testCaseFiles.forEach(file => {
        formData.append('files', file);
      });
      
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await adminApi.uploadTestcases(formData);
      console.log('Upload response:', response);
      fetchProblems();
      handleCloseTestCasesDialog();
    } catch (err) {
      console.error('Full error:', err);
      setError('Failed to upload test cases');
      console.error('Upload test cases error:', err);
    }
  };

  const handleSolutionSubmit = async () => {
    try {
      const formData = new FormData();
      const problemId = selectedProblem.id || selectedProblem._id;
      formData.append('problem_id', problemId);
      solutionFiles.forEach(file => {
        formData.append('files', file);
      });
      await adminApi.addSolution(formData);
      fetchProblems();
      handleCloseSolutionDialog();
    } catch (err) {
      setError('Failed to upload solution');
      console.error('Upload solution error:', err);
    }
  };

  const handleTestCasesChange = (e) => {
    setTestCaseFiles(Array.from(e.target.files));
  };

  const handleSolutionChange = (e) => {
    setSolutionFiles(Array.from(e.target.files));
  };

  const handleDeleteProblem = async (problemId) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await adminApi.deleteProblem(problemId);
        setProblems(prevProblems => prevProblems.filter(problem => problem.id !== problemId));
      } catch (err) {
        setError('Failed to delete problem');
        console.error('Delete problem error:', err);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewProblem = async (problem) => {
    setSelectedProblem(problem);
    setLoadingDetails(true);
    setOpenDetailsDialog(true);
    try {
      const response = await adminApi.getProblemById(problem.id);
      setProblemDetails(response.data);
    } catch (err) {
      setError('Failed to fetch problem details');
      console.error('Fetch problem details error:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setProblemDetails(null);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Problems Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Problem
        </Button>
      </Box>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Event Name</TableCell>
              <TableCell>Is Junior</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : problems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No problems found
                </TableCell>
              </TableRow>
            ) : (
              problems.map((problem) => (
                <TableRow 
                  key={problem.id}
                  hover
                  onClick={() => handleViewProblem(problem)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{problem.id}</TableCell>
                  <TableCell>{problem.title}</TableCell>
                  <TableCell>{problem.event_name}</TableCell>
                  <TableCell>{problem.is_junior ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{formatDate(problem.created_at)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProblem(problem);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Problem">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(problem);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Upload Test Cases">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTestCasesDialog(problem);
                        }}
                      >
                        <UploadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Upload Solution">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSolutionDialog(problem);
                        }}
                      >
                        <UploadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Problem">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProblem(problem.id);
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProblem ? 'Edit Problem' : 'Add New Problem'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Description</Typography>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 1 }}>
                <Tab label="Edit" />
                <Tab label="Preview" />
              </Tabs>
              {activeTab === 0 ? (
                <MDEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value || '' })}
                  preview="edit"
                  height={300}
                />
              ) : (
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid #ddd', 
                  borderRadius: 1,
                  minHeight: 300,
                  maxHeight: 500,
                  overflow: 'auto'
                }}>
                  <ReactMarkdown>
                    {formData.description || '*No description provided*'}
                  </ReactMarkdown>
                </Box>
              )}
            </Box>

            <TextField
              margin="dense"
              label="Score"
              type="number"
              fullWidth
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
              required
            />
            <TextField
              margin="dense"
              label="Input Format"
              fullWidth
              multiline
              rows={2}
              value={formData.input_format}
              onChange={(e) => setFormData({ ...formData, input_format: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Output Format"
              fullWidth
              multiline
              rows={2}
              value={formData.output_format}
              onChange={(e) => setFormData({ ...formData, output_format: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Constraints"
              fullWidth
              multiline
              rows={2}
              value={formData.constraints}
              onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
            />
            
            <TextField
              margin="dense"
              label="Event Name"
              fullWidth
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Time Limit (ms)"
              type="number"
              fullWidth
              value={formData.time_limit}
              onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
              required
            />
            <TextField
              margin="dense"
              label="Memory Limit (MB)"
              type="number"
              fullWidth
              value={formData.memory_limit}
              onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) })}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Is Junior</InputLabel>
              <Select
                value={formData.is_junior}
                onChange={(e) => setFormData({ ...formData, is_junior: e.target.value })}
                label="Is Junior"
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Sample Test Cases</Typography>
            {formData.samples.map((sample, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography variant="subtitle1">Sample {index + 1}</Typography>
                <TextField
                  margin="dense"
                  label="Input"
                  fullWidth
                  multiline
                  rows={2}
                  value={sample.input}
                  onChange={(e) => {
                    const newSamples = [...formData.samples];
                    newSamples[index].input = e.target.value;
                    setFormData({ ...formData, samples: newSamples });
                  }}
                  required
                />
                <TextField
                  margin="dense"
                  label="Output"
                  fullWidth
                  multiline
                  rows={2}
                  value={sample.output}
                  onChange={(e) => {
                    const newSamples = [...formData.samples];
                    newSamples[index].output = e.target.value;
                    setFormData({ ...formData, samples: newSamples });
                  }}
                  required
                />
                <TextField
                  margin="dense"
                  label="Explanation"
                  fullWidth
                  multiline
                  rows={2}
                  value={sample.explanation}
                  onChange={(e) => {
                    const newSamples = [...formData.samples];
                    newSamples[index].explanation = e.target.value;
                    setFormData({ ...formData, samples: newSamples });
                  }}
                />
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() => setFormData({
                ...formData,
                samples: [...formData.samples, { input: '', output: '', explanation: '' }]
              })}
            >
              Add Sample
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedProblem ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openTestCasesDialog} onClose={handleCloseTestCasesDialog}>
        <DialogTitle>Upload Test Cases</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept=".txt,.in,.out"
              style={{ display: 'none' }}
              id="test-case-files"
              type="file"
              multiple
              onChange={handleTestCasesChange}
            />
            <label htmlFor="test-case-files">
              <Button variant="outlined" component="span">
                Select Test Case Files
              </Button>
            </label>
            {testCaseFiles.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {testCaseFiles.length} file(s) selected
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestCasesDialog}>Cancel</Button>
          <Button 
            onClick={handleTestCasesSubmit} 
            variant="contained"
            disabled={testCaseFiles.length === 0}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSolutionDialog} onClose={handleCloseSolutionDialog}>
        <DialogTitle>Upload Solution</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <input
              accept=".cpp,.java,.py"
              style={{ display: 'none' }}
              id="solution-files"
              type="file"
              multiple
              onChange={handleSolutionChange}
            />
            <label htmlFor="solution-files">
              <Button variant="outlined" component="span">
                Select Solution Files
              </Button>
            </label>
            {solutionFiles.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {solutionFiles.length} file(s) selected
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSolutionDialog}>Cancel</Button>
          <Button 
            onClick={handleSolutionSubmit} 
            variant="contained"
            disabled={solutionFiles.length === 0}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openDetailsDialog} 
        onClose={handleCloseDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Problem Details
        </DialogTitle>
        <DialogContent>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : problemDetails ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {problemDetails.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                ID: {problemDetails.id}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Event: {problemDetails.event_name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Junior Problem: {problemDetails.is_junior ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Score: {problemDetails.score}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Time Limit: {problemDetails.time_limit}ms
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Memory Limit: {problemDetails.memory_limit}MB
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Description
              </Typography>
              <Box sx={{ 
                p: 2, 
                border: '1px solid #ddd', 
                borderRadius: 1,
                mb: 3
              }}>
                <ReactMarkdown>
                  {problemDetails.description || '*No description provided*'}
                </ReactMarkdown>
              </Box>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Input Format
              </Typography>
              <Typography variant="body1" paragraph>
                {problemDetails.input_format}
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Output Format
              </Typography>
              <Typography variant="body1" paragraph>
                {problemDetails.output_format}
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Constraints
              </Typography>
              <Typography variant="body1" paragraph>
                {problemDetails.constraints || 'No constraints specified'}
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Sample Test Cases
              </Typography>
              {problemDetails.samples?.map((sample, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sample {index + 1}
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    Input:
                    {sample.input}
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    Output:
                    {sample.output}
                  </Typography>
                  {sample.explanation && (
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                      Explanation:
                      {sample.explanation}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="error">
              Failed to load problem details
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 