import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const AdminLogin = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in and is admin/officer, redirect to appropriate dashboard
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'officer') {
        navigate('/officer');
      } else {
        // Non-admin/officer users should be shown error and logged out
        setError('Access denied. Administrator or officer credentials required.');
        // You could also call logout here if needed
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.identifier, formData.password);
      // Note: The useEffect will handle redirection based on user role
      // If login succeeds but user is not admin/officer, they'll be redirected
    } catch (error: any) {
      if (error.message.includes('role') || error.message.includes('admin')) {
        setError('Access denied. Admin or officer credentials required.');
      } else {
        setError(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl" />
      
      <div className="max-w-md w-full relative">
        {/* Professional Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl mb-6 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Administration Portal
          </h1>
          <p className="text-slate-600">
            Secure access to GOVCONNECT management system
          </p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">System Online</span>
          </div>
        </div>

        {/* Professional Login Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Administrator Sign In
            </h2>
            <p className="text-slate-600 text-center">
              Enter your admin credentials to access the system
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/NIC Input */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email or NIC Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="admin@gov.lk or NIC number"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Keep me signed in
                </label>
              </div>
              <div className="text-sm">
                <button type="button" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium mb-1">Security Notice</p>
                <p className="text-yellow-700">
                  This is a secure admin portal. All activities are logged and monitored for security purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Not an administrator?{' '}
              <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                Citizen Login
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link to="/" className="font-medium text-red-600 hover:text-red-500">
                Back to Home
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-red-200 text-sm">
            © 2024 Government of Sri Lanka. All rights reserved.
          </p>
          <p className="text-red-300 text-xs mt-1">
            Powered by GOVCONNECT Admin System
          </p>
          {/* Hidden admin registration link */}
          <p className="text-red-400 text-xs mt-2 opacity-50">
            <Link to="/admin/register" className="hover:opacity-100 transition-opacity">
              System Setup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};