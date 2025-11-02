import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const storageUserKey = 'promptly_user';
const storageTokenKey = 'promptly_token';

const setAuth = (token, user) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(storageTokenKey, token);
  }
  if (user) {
    localStorage.setItem(storageUserKey, JSON.stringify(user));
  }
};

const clearAuth = () => {
  delete axios.defaults.headers.common['Authorization'];
  localStorage.removeItem(storageUserKey);
  localStorage.removeItem(storageTokenKey);
};

const authService = {
  login: async ({ email, password }) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    // server responds with { success, token, user }
    if (res.data?.token) {
      setAuth(res.data.token, res.data.user);
    }
    return res.data;
  },

  register: async ({ name, email, password }) => {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
    if (res.data?.token) {
      setAuth(res.data.token, res.data.user);
    }
    return res.data;
  },

  logout: () => {
    clearAuth();
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem(storageUserKey);
    const token = localStorage.getItem(storageTokenKey);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return raw ? JSON.parse(raw) : null;
  },

  getProtectedData: async () => {
    // this hits /api/auth/me which is protected
    return axios.get(`${API_BASE_URL}/auth/me`);
  }
};

export default authService;
