import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is important for cookies to be sent with requests
});

// Add request interceptor to include token from cookies
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear the token and redirect to login
      Cookies.remove('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: async (credentials) => {
    try {
      const response = await api.post('/admin/login', credentials);
      if (response.data.token) {
        // Set token in cookie with expiration
        Cookies.set('adminToken', response.data.token, { 
          expires: 1, // 1 day
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        return response;
      }
      throw new Error('No token received');
    } catch (error) {
      // Clear any existing token on login failure
      Cookies.remove('adminToken');
      throw error;
    }
  },

  logout: () => {
    Cookies.remove('adminToken');
    window.location.href = '/login';
  },

  registerAdmin: (adminData) => api.post('/admin/register-admin', adminData),

  // Users
  getAllUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Teams
  getAllTeams: () => api.get('/admin/teams'),
  deleteTeam: (id) => api.delete(`/admin/teams/${id}`),

  // Problems
  getProblemById: (id) => api.get(`/problems/${id}`),
  getAllProblems: () => api.get('/admin/problems'),
  addProblem: (problemData) => api.post('/admin/problems', problemData),
  updateProblem: (id, problemData) => api.put(`/admin/problems/${id}`, problemData),
  deleteProblem: (id) => api.delete(`/admin/problems/${id}`),
  uploadTestcases: (formData) => 
    api.post('/admin/upload-testcases', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  addSolution: (formData) =>
    api.post('/admin/upload-solution', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Submissions
  getAllSubmissions: (filters) => api.get('/admin/submissions', { params: filters }),
};

export default api; 