import axios from 'axios';

const API_BASE_URL = 'https://api.shumbawheels.co.zw/api/admin';

// Create axios instance with common config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  // User management
  getUsers: () => api.get('/users'),
  getUsersCount: () => api.get('/count-clients'),
  createUser: (userData) => api.post('/create-user', userData),
  updateUser: (userId, userData) => api.post(`/update-user/${userId}`, userData),
  deleteUser: (userId) => api.post(`/delete-user/${userId}`),
  
  // Question management
  getQuestions: () => api.get('/get-questions'),
  createQuestion: (questionData) => api.post('/create-question', questionData),
  updateQuestion: (questionId, questionData) => api.post(`/update-question/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/delete-question/${questionId}`),
  
  // Dashboard statistics
  getQuestionsCount: () => api.get('/count-questions'),
  getTestsCount: () => api.get('/count-tests'),
  getPassCount: () => api.get('/count-pass'),
  getPaymentsCount: () => api.get('/count-payments'),
  getBookingsCount: () => api.get('/count-bookings'),
  getWeeklyStats: () => api.get('/week-stats'),

  getUserBookings: () => api.get('/get-user-bookings'),
  updateUserBooking: (bookingId, bookingData) => api.post(`/update-user-booking/${bookingId}`, bookingData),
  deleteUserBooking: (bookingId) => api.delete(`/delete-user-booking/${bookingId}`),

  // Settings and Password Management
  changeAdminPassword: (data) => api.post('/change-admin-password', data),
  changeUserPassword: (data) => api.post('/change-user-password', data),
  updatePrices: (data) => api.post('/price', data),
  getPrices: () => api.get('/get-prices'),

  // Report Data Endpoints
  getPayments: () => api.get('/get-payments'),
  getBookings: () => api.get('/get-bookings'),
  getTests: () => api.get('/get-test'), 

   // Notes Management
  // Categories
  createCategory: (categoryData) => api.post('/create-category', categoryData),
  getCategories: () => api.get('/get-categories'),
  updateCategory: (categoryId, categoryData) => api.post(`/update-category/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/delete-category/${categoryId}`),

  // Lessons
  createLesson: (lessonData) => api.post('/create-lesson', lessonData),
  getLessons: () => api.get('/get-lessons'),
  updateLesson: (lessonId, lessonData) => api.post(`/update-lesson/${lessonId}`, lessonData),
  deleteLesson: (lessonId) => api.delete(`/delete-lesson/${lessonId}`),

  // Notes
  createNote: (noteData) => api.post('/create-notes', noteData),
  getNotes: () => api.get('/get-notes'),
  updateNote: (noteId, noteData) => api.post(`/update-notes/${noteId}`, noteData),
  deleteNote: (noteId) => api.delete(`/delete-note/${noteId}`),

   // Answer Management
   // In adminService.js, add this to the adminService object:
  createAnswer: (answerData) => api.post('/create-answer', answerData),
  getAnswers: () => api.get('/get-answers'),
  updateAnswer: (answerId, answerData) => api.put(`/update-answer/${answerId}`, answerData),
  deleteAnswer: (answerId) => api.delete(`/delete-answer/${answerId}`),

  // Road Signs Management
createSign: (signData) => api.post('/create-signs', signData),
getSigns: () => api.get('/get-signs'),
updateSign: (signId, signData) => api.post(`/update-sign/${signId}`, signData),
deleteSign: (signId) => api.delete(`/delete-sign/${signId}`),

};

export default adminService;