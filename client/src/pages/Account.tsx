import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Shield,
  Bell,
  Globe,
  Edit3,
  Check,
  X,
  Lock,
  Settings,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Activity,
  Star,
  CreditCard,
  ArrowRight
} from 'lucide-react';

export const Account = () => {
  const { user, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    language: user?.preferences?.language || 'english',
    notificationMethod: user?.preferences?.notificationMethod || 'email'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async () => {
    // TODO: Implement profile update API call
    console.log('Saving profile:', formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      language: user?.preferences?.language || 'english',
      notificationMethod: user?.preferences?.notificationMethod || 'email'
    });
    setEditMode(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // TODO: Implement password change API call
    console.log('Changing password');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setChangePasswordMode(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white md:bg-slate-50">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Account Settings</h1>
            <p className="text-slate-600">Manage your profile, preferences, and security settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Overview */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-slate-500 capitalize mb-3">{user.role}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Shield size={16} className={user.isVerified ? 'text-emerald-500' : 'text-amber-500'} />
                    <span className={`text-sm font-medium ${user.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {user.isVerified ? 'Verified Account' : 'Verification Pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-lg font-bold text-blue-600">5</p>
                      <p className="text-xs text-blue-600">Total</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-lg font-bold text-emerald-600">2</p>
                      <p className="text-xs text-emerald-600">Completed</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-lg font-bold text-amber-600">1</p>
                      <p className="text-xs text-amber-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center space-x-3">
                    <Activity size={18} className="text-slate-400" />
                    <span className="text-slate-700">Activity Log</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center space-x-3">
                    <Star size={18} className="text-slate-400" />
                    <span className="text-slate-700">Saved Services</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center space-x-3">
                    <CreditCard size={18} className="text-slate-400" />
                    <span className="text-slate-700">Payment Methods</span>
                  </button>
                </div>
              </div>
      </div>

            {/* Right Column - Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                      <p className="text-sm text-slate-500">Update your personal details and contact information</p>
                    </div>
          <button
            onClick={() => setEditMode(!editMode)}
                      className={`p-3 rounded-xl transition-all duration-200 ${
              editMode 
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        First Name
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 py-3 px-4 bg-slate-50 rounded-xl">
                          <User size={18} className="text-slate-400" />
                          <span className="text-slate-900">{user.firstName}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 py-3 px-4 bg-slate-50 rounded-xl">
                          <User size={18} className="text-slate-400" />
                          <span className="text-slate-900">{user.lastName}</span>
                        </div>
                      )}
                    </div>

                    {/* NIC - Read only */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        NIC Number
                      </label>
                      <div className="flex items-center space-x-3 py-3 px-4 bg-slate-50 rounded-xl">
                        <Shield size={18} className="text-slate-400" />
                        <span className="text-slate-900 font-mono">{user.nic}</span>
                        <span className="text-xs text-slate-500 ml-auto">Cannot be changed</span>
                      </div>
                    </div>

                    {/* Email - Read only */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-3 py-3 px-4 bg-slate-50 rounded-xl">
                        <Mail size={18} className="text-slate-400" />
                        <span className="text-slate-900">{user.email}</span>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      {editMode ? (
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          placeholder="0771234567"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 py-3 px-4 bg-slate-50 rounded-xl">
                          <Phone size={18} className="text-slate-400" />
                          <span className="text-slate-900">{user.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    {user.address && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Address
                        </label>
                        <div className="flex items-start space-x-3 py-3 px-4 bg-slate-50 rounded-xl">
                          <MapPin size={18} className="text-slate-400 mt-1" />
                          <div>
                            <p className="text-slate-900">
                              {user.address.street && `${user.address.street}, `}
                              {user.address.city}
                            </p>
                            <p className="text-sm text-slate-600">
                              {user.address.district}, {user.address.province}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save/Cancel Buttons */}
                  {editMode && (
                    <div className="flex space-x-4 mt-6 pt-6 border-t border-slate-200">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
                      >
                        <Check size={18} />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-slate-100 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <X size={18} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Preferences</h3>
                  <p className="text-sm text-slate-500">Customize your experience</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Preferred Language
                      </label>
                      <div className="flex items-center space-x-3 py-3 px-4 bg-slate-50 rounded-xl">
                        <Globe size={18} className="text-slate-400" />
                        <span className="text-slate-900 capitalize">{user.preferences?.language || 'english'}</span>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Notification Method
                      </label>
                      <div className="flex items-center space-x-3 py-3 px-4 bg-slate-50 rounded-xl">
                        <Bell size={18} className="text-slate-400" />
                        <span className="text-slate-900 capitalize">
                          {user.preferences?.notificationMethod === 'both' ? 'Email & SMS' : user.preferences?.notificationMethod || 'email'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Security Settings</h3>
                  <p className="text-sm text-slate-500">Keep your account secure</p>
                </div>

                <div className="p-6">
                  {changePasswordMode ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 transition-colors"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 transition-colors"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <div className="flex space-x-4 pt-4">
                        <button
                          onClick={handlePasswordChange}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
                        >
                          Change Password
                        </button>
                        <button
                          onClick={() => {
                            setChangePasswordMode(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="flex-1 bg-slate-100 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setChangePasswordMode(true)}
                      className="w-full text-left p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <Lock size={18} className="text-slate-400 group-hover:text-slate-600" />
                        <span className="text-slate-700 font-medium">Change Password</span>
                      </div>
                      <span className="text-slate-400 group-hover:text-slate-600">›</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Account Actions</h3>
                  <p className="text-sm text-slate-500">Manage your account settings</p>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    <button className="w-full text-left p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between group">
                      <div className="flex items-center space-x-3">
                        <Settings size={18} className="text-slate-400 group-hover:text-slate-600" />
                        <span className="text-slate-700 font-medium">Privacy Settings</span>
                      </div>
                      <span className="text-slate-400 group-hover:text-slate-600">›</span>
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors flex items-center space-x-3 group"
                    >
                      <LogOut size={18} className="text-amber-600" />
                      <span className="text-amber-600 font-medium">Sign Out</span>
                    </button>
                    
                    <button className="w-full text-left p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center space-x-3 group">
                      <Trash2 size={18} className="text-red-600" />
                      <span className="text-red-600 font-medium">Delete Account</span>
          </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

      {/* Mobile Native App Layout */}
      <div className="md:hidden bg-white min-h-screen">
        {/* Profile Hero Section */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-4 pt-6 pb-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl font-bold text-white">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </span>
          </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-blue-100 capitalize mb-3">{user.role}</p>
            
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Shield size={16} className={user.isVerified ? 'text-emerald-300' : 'text-amber-300'} />
              <span className={`text-sm font-medium ${user.isVerified ? 'text-emerald-200' : 'text-amber-200'}`}>
                {user.isVerified ? 'Verified Account' : 'Verification Pending'}
              </span>
        </div>

        {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                <p className="text-xl font-bold text-white">5</p>
                <p className="text-xs text-blue-100">Total</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                <p className="text-xl font-bold text-white">2</p>
                <p className="text-xs text-blue-100">Completed</p>
          </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                <p className="text-xl font-bold text-white">1</p>
                <p className="text-xs text-blue-100">Upcoming</p>
          </div>
          </div>
        </div>
      </div>

        {/* Content Sections */}
        <div className="px-4 py-6 space-y-4">
          {/* Personal Information Section */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`p-2 rounded-xl transition-colors ${
                  editMode 
                    ? 'bg-gray-200 text-gray-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                <Edit3 size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
          {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              ) : (
                    <div className="flex items-center space-x-3 py-2.5 px-3 bg-white rounded-xl">
                      <User size={16} className="text-gray-400" />
                      <span className="text-gray-900 text-sm">{user.firstName}</span>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              ) : (
                    <div className="flex items-center space-x-3 py-2.5 px-3 bg-white rounded-xl">
                      <User size={16} className="text-gray-400" />
                      <span className="text-gray-900 text-sm">{user.lastName}</span>
                </div>
              )}
            </div>
          </div>

          {/* NIC - Read only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIC Number
            </label>
                <div className="flex items-center space-x-3 py-2.5 px-3 bg-white rounded-xl">
                  <Shield size={16} className="text-gray-400" />
                  <span className="text-gray-900 font-mono text-sm">{user.nic}</span>
                  <span className="text-xs text-gray-500 ml-auto">Protected</span>
            </div>
          </div>

          {/* Email - Read only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
                <div className="flex items-center space-x-3 py-2.5 px-3 bg-white rounded-xl">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-900 text-sm">{user.email}</span>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            {editMode ? (
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="0771234567"
              />
            ) : (
                  <div className="flex items-center space-x-3 py-2.5 px-3 bg-white rounded-xl">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-gray-900 text-sm">{user.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Save/Cancel Buttons */}
        {editMode && (
              <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold active:from-blue-700 active:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
                  <Check size={18} />
                  <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold active:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
                  <X size={18} />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

          {/* Preferences Section */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
            
            <div className="space-y-4">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
            </label>
                <div className="flex items-center space-x-3 py-2.5 px-3 bg-white rounded-xl">
                  <Globe size={16} className="text-gray-400" />
                  <span className="text-gray-900 text-sm capitalize">{user.preferences?.language || 'english'}</span>
              </div>
          </div>

          {/* Notifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notifications
            </label>
                <div className="flex items-center space-x-3 py-2.5 px-3 bg-white rounded-xl">
                  <Bell size={16} className="text-gray-400" />
                  <span className="text-gray-900 text-sm capitalize">
                    {user.preferences?.notificationMethod === 'both' ? 'Email & SMS' : user.preferences?.notificationMethod || 'email'}
                </span>
              </div>
          </div>
        </div>
      </div>

          {/* Security Section */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
        
        {changePasswordMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 text-sm"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 active:text-gray-700"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 text-sm"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 active:text-gray-700"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="Confirm new password"
              />
            </div>

                <div className="flex space-x-3 pt-2">
              <button
                onClick={handlePasswordChange}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold active:from-blue-700 active:to-indigo-700 transition-all duration-200"
              >
                    Update Password
              </button>
              <button
                onClick={() => {
                  setChangePasswordMode(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold active:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
            <button
              onClick={() => setChangePasswordMode(true)}
                className="w-full flex items-center space-x-3 p-3 bg-white rounded-xl active:bg-gray-100 transition-colors"
            >
                <Lock size={18} className="text-gray-500" />
                <span className="text-gray-700 font-medium">Change Password</span>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
            </button>
        )}
      </div>

      {/* Account Actions */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
        
        <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-white rounded-xl active:bg-gray-100 transition-colors">
                <Settings size={18} className="text-gray-500" />
              <span className="text-gray-700 font-medium">Privacy Settings</span>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
          </button>
          
          <button 
            onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 bg-amber-50 rounded-xl active:bg-amber-100 transition-colors"
          >
                <LogOut size={18} className="text-amber-600" />
                <span className="text-amber-600 font-medium">Sign Out</span>
          </button>
          
              <button className="w-full flex items-center space-x-3 p-3 bg-red-50 rounded-xl active:bg-red-100 transition-colors">
                <Trash2 size={18} className="text-red-600" />
            <span className="text-red-600 font-medium">Delete Account</span>
          </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};