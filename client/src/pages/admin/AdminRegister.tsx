import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, UserPlus } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Department {
  _id: string;
  name: string;
  code: string;
}

export const AdminRegister = () => {
  const [formData, setFormData] = useState({
    nic: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'admin' | 'officer',
    department: '',
    setupKey: ''
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch departments when component mounts
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/departments`);
        setDepartments(response.data.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.nic || !formData.email || !formData.firstName || 
        !formData.lastName || !formData.phoneNumber || !formData.password) {
      setError('All fields are required');
      return false;
    }

    // Validate NIC format (Sri Lankan)
    const nicRegex = /^(\d{9}[vVxX]|\d{12})$/;
    if (!nicRegex.test(formData.nic)) {
      setError('Invalid NIC format. Use old format (123456789V) or new format (123456789012)');
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    // Validate phone number (Sri Lankan)
    const phoneRegex = /^(0\d{9})$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Invalid phone number format. Use format: 0771234567');
      return false;
    }

    // Validate password
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Validate department for officers
    if (formData.role === 'officer' && !formData.department) {
      setError('Department is required for officers');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for submission
      const submitData = {
        nic: formData.nic,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role,
        ...(formData.setupKey && { setupKey: formData.setupKey }),
        ...(formData.role === 'officer' && formData.department && { department: formData.department })
      };

      // Since this is admin registration, we'll use the setup endpoint
      await axios.post(`${API_BASE_URL}/admin/setup`, submitData);
      
      setSuccess(`${formData.role === 'admin' ? 'Administrator' : 'Officer'} account created successfully!`);
      
      // Reset form
      setFormData({
        nic: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        role: 'admin',
        department: '',
        setupKey: ''
      });

      // Redirect to admin login after 2 seconds
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);

    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Admin Account</h1>
            <p className="text-gray-600">
              Register a new administrator or officer account
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Setup Key (Optional) */}
            <div>
              <label htmlFor="setupKey" className="block text-sm font-medium text-gray-700 mb-2">
                Setup Key <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                id="setupKey"
                name="setupKey"
                value={formData.setupKey}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                placeholder="Leave blank for default setup"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional security key for initial system setup
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                required
              >
                <option value="admin">Administrator</option>
                <option value="officer">Government Officer</option>
              </select>
            </div>

            {/* Department Selection (only for officers) */}
            {formData.role === 'officer' && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  required={formData.role === 'officer'}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* NIC Number */}
            <div>
              <label htmlFor="nic" className="block text-sm font-medium text-gray-700 mb-2">
                NIC Number
              </label>
              <input
                type="text"
                id="nic"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                placeholder="123456789V or 123456789012"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                placeholder="admin@govconnect.lk"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                placeholder="0771234567"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors pr-12"
                  placeholder="Enter password (min. 6 characters)"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors pr-12"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus size={20} />
              <span>{loading ? 'Creating Account...' : `Create ${formData.role === 'admin' ? 'Admin' : 'Officer'} Account`}</span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link 
              to="/admin/login"
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              ← Back to Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
