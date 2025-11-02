import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from './services/authService.js';
import SearchRecipes from './components/SearchRecipes';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  // Connection status message
  const [connectionMessage, setConnectionMessage] = useState('');

  // Auth-related state
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLogin, setIsLogin] = useState(true);

  // On mount: check auth, test API connection
  useEffect(() => {
    const user = authService.getCurrentUser?.();
    if (user) {
      setCurrentUser(user);
    }

    const testConnection = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/test`);
        setConnectionMessage(response.data.message || 'Connected');
      } catch (error) {
        setConnectionMessage('Failed to connect to server');
        console.error('API connection error:', error);
      }
    };

    testConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth handlers (from provided auth code)
  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage('');

    try {
      if (isLogin) {
        const result = await authService.login({ email: authForm.email, password: authForm.password });
        setCurrentUser(result.user);
        setAuthMessage('Login successful!');
      } else {
        if (authForm.password !== authForm.confirmPassword) {
          setAuthMessage('Passwords do not match');
          setLoading(false);
          return;
        }

        const result = await authService.register({ name: authForm.name, email: authForm.email, password: authForm.password });
        setCurrentUser(result.user);
        setAuthMessage('Registration successful!');
      }

      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      setAuthMessage(
        error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout?.();
    setCurrentUser(null);
    setAuthMessage('Logged out successfully');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthMessage('');
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Recipe Finder</h1>
        </div>
      </header>
      
      <main>
        {!currentUser ? (
          <div className="max-w-md mx-auto mt-8">
            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Connection Status</h2>
              <p className={`text-lg ${connectionMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
                {connectionMessage}
              </p>
            </div>

            {/* Auth Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-center">{isLogin ? 'Login' : 'Register'}</h2>

              {authMessage && (
                <div className={`mb-4 p-3 rounded ${authMessage.toLowerCase().includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {authMessage}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={authForm.name}
                      onChange={handleAuthChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={authForm.email}
                    onChange={handleAuthChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={authForm.password}
                    onChange={handleAuthChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={authForm.confirmPassword}
                      onChange={handleAuthChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                      required={!isLogin}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition duration-200"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button onClick={toggleAuthMode} className="text-blue-500 hover:text-blue-700">
                  {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Welcome Section */}
            <div className="max-w-md mx-auto mt-8 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4 text-center">Welcome, {currentUser.name}!</h2>

                {authMessage && (
                  <div className={`mb-4 p-3 rounded ${authMessage.toLowerCase().includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {authMessage}
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Role:</strong> {currentUser.role}</p>
                  <p><strong>ID:</strong> {currentUser.id}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                  >
                    Logout
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const result = await authService.getProtectedData();
                        setAuthMessage('Protected data loaded: ' + JSON.stringify(result.data));
                      } catch (error) {
                        setAuthMessage('Failed to load protected data');
                      }
                    }}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                  >
                    Test Protected Route
                  </button>
                </div>
              </div>
            </div>

            {/* Search Recipes */}
            <SearchRecipes />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;