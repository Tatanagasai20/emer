import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_64ea9c06-2fba-4fbc-94f8-49d919fc1e30/artifacts/vzx54xiv_Screenshot%202025-10-15%20at%2010.28.55%E2%80%AFAM.png';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(credentials);
      onLogin(response.data.user, response.data.access_token);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="logo-container mb-6">
            <img src={LOGO_URL} alt="Priacc Innovations" className="logo-image mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Portal</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700" data-testid="login-error-message">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Employee ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter email or employee ID"
                required
                data-testid="login-username-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter password"
                required
                data-testid="login-password-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              data-testid="forgot-password-link"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="login-submit-button"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Default Admin: admin@priacc.com / Admin@123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
