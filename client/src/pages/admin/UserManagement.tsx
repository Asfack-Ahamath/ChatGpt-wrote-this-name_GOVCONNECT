import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit3, 
  Trash2, 
  Shield,
  ShieldCheck,
  UserCog,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AdminUser {
  _id: string;
  nic: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'admin' | 'officer' | 'citizen';
  department?: {
    name: string;
    code: string;
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface CreateUserData {
  nic: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'admin' | 'officer';
  password: string;
  department?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    nic: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'officer',
    password: '',
    department: ''
  });

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Administrators' },
    { value: 'officer', label: 'Officers' }
  ];

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`);
      const allUsers = response.data.data;
      // Filter to show only admin and officer roles
      const adminUsers = allUsers.filter((user: AdminUser) => 
        user.role === 'admin' || user.role === 'officer'
      );
      setUsers(adminUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async () => {
    try {
      await axios.post(`${API_BASE_URL}/admin/users`, createUserData);
      setShowCreateModal(false);
      setCreateUserData({
        nic: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: 'officer',
        password: '',
        department: ''
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldCheck size={16} className="text-red-600" />;
      case 'officer': return <UserCog size={16} className="text-blue-600" />;
      default: return <Shield size={16} className="text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'officer': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage administrators and officers</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              Total: {filteredUsers.length} users
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 gap-1">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </span>
                        {user.isVerified ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Pending
                          </span>
                        )}
                        {!user.isActive && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail size={16} />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone size={16} />
                          <span>{user.phoneNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} />
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {user.department && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Department:</span> {user.department.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        user.isActive 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New User</h2>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={createUserData.firstName}
                    onChange={(e) => setCreateUserData({...createUserData, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={createUserData.lastName}
                    onChange={(e) => setCreateUserData({...createUserData, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIC Number
                </label>
                <input
                  type="text"
                  value={createUserData.nic}
                  onChange={(e) => setCreateUserData({...createUserData, nic: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="123456789V or 200012345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={createUserData.email}
                  onChange={(e) => setCreateUserData({...createUserData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={createUserData.phoneNumber}
                  onChange={(e) => setCreateUserData({...createUserData, phoneNumber: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="0771234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={createUserData.role}
                  onChange={(e) => setCreateUserData({...createUserData, role: e.target.value as 'admin' | 'officer'})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                >
                  <option value="officer">Officer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {createUserData.role === 'officer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={createUserData.department}
                    onChange={(e) => setCreateUserData({...createUserData, department: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={createUserData.password}
                    onChange={(e) => setCreateUserData({...createUserData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none pr-12"
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
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={handleCreateUser}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Create User
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};