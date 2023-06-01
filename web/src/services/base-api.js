import axios from 'axios';

const http = axios.create({
  baseURL: process.env.REACT_APP_BASE_API_URL || 'http://localhost:3002/api/v1'
})

http.interceptors.response.use(
  response => response.data,
  error => {
    const status = error.response?.status;
    if (status === 401 && !window.location.href.includes('login')) {
      localStorage.removeItem('current-user');
      localStorage.removeItem('user-access-token');
      window.location.href = '/';
      return Promise.resolve();
    } else {
      return Promise.reject(error);
    }
  }
)

export default http;