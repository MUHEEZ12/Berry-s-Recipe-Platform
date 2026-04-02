import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  } else {
    // No token available
    console.warn('No auth token found in localStorage');
  }
  return config;
});

// Handle 401 errors and clear invalid tokens
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid/expired token
      localStorage.removeItem('auth');
      console.warn('Unauthorized - Token cleared. User should log in again.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  getProfile: () => apiClient.get('/auth/profile'),
};

// Recipe API
export const recipeAPI = {
  getAll: (params) => apiClient.get('/recipes', { params }),
  getById: (id) => apiClient.get(`/recipes/${id}`),
  create: (payload) => apiClient.post('/recipes', payload),
  update: (id, payload) => apiClient.put(`/recipes/${id}`, payload),
  delete: (id) => apiClient.delete(`/recipes/${id}`),
  like: (id) => apiClient.post(`/recipes/${id}/like`),
  favorite: (id) => apiClient.post(`/recipes/${id}/favorite`),
  getTrending: () => apiClient.get('/recipes/trending'),
  getFavorites: () => apiClient.get('/recipes/user/favorites'),
};

// Comment API
export const commentAPI = {
  getByRecipe: (recipeId) => apiClient.get(`/recipes/${recipeId}/comments`),
  create: (recipeId, payload) => apiClient.post(`/recipes/${recipeId}/comments`, payload),
  delete: (recipeId, commentId) => apiClient.delete(`/recipes/${recipeId}/comments/${commentId}`),
};
