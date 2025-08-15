import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Shield,
  Bell,
  Globe,
  Edit3,
  Check,
  X
} from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    language: user?.preferences?.language || 'english',
    notificationMethod: user?.preferences?.notificationMethod || 'email'
  });

  const handleSave = () => {
    // TODO: Implement profile update API call
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

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`p-3 rounded-full ${
              editMode 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-primary-100 text-primary-600'
            }`}
          >
            <Edit3 size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-sri-green to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600">{user.role === 'citizen' ? 'Citizen' : 'Government Officer'}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Shield size={16} className={user.isVerified ? 'text-green-500' : 'text-yellow-500'} />
              <span className={`text-sm ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {user.isVerified ? 'Verified Account' : 'Verification Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">5</p>
            <p className="text-sm text-blue-600">Total Appointments</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">2</p>
            <p className="text-sm text-green-600">Completed</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-xl">
            <p className="text-2xl font-bold text-orange-600">1</p>
            <p className="text-sm text-orange-600">Upcoming</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              ) : (
                <div className="flex items-center space-x-3 py-2">
                  <User size={18} className="text-gray-400" />
                  <span className="text-gray-900">{user.firstName}</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              ) : (
                <div className="flex items-center space-x-3 py-2">
                  <User size={18} className="text-gray-400" />
                  <span className="text-gray-900">{user.lastName}</span>
                </div>
              )}
            </div>
          </div>

          {/* NIC - Read only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIC Number
            </label>
            <div className="flex items-center space-x-3 py-2 px-3 bg-gray-50 rounded-lg">
              <Shield size={18} className="text-gray-400" />
              <span className="text-gray-900 font-mono">{user.nic}</span>
              <span className="text-xs text-gray-500 ml-auto">Cannot be changed</span>
            </div>
          </div>

          {/* Email - Read only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center space-x-3 py-2 px-3 bg-gray-50 rounded-lg">
              <Mail size={18} className="text-gray-400" />
              <span className="text-gray-900">{user.email}</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="0771234567"
              />
            ) : (
              <div className="flex items-center space-x-3 py-2">
                <Phone size={18} className="text-gray-400" />
                <span className="text-gray-900">{user.phoneNumber}</span>
              </div>
            )}
          </div>

          {/* Address */}
          {user.address && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="flex items-start space-x-3 py-2">
                <MapPin size={18} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-900">
                    {user.address.street && `${user.address.street}, `}
                    {user.address.city}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.address.district}, {user.address.province}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
        
        <div className="space-y-4">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Language
            </label>
            {editMode ? (
              <select
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="english">English</option>
                <option value="sinhala">සිංහල (Sinhala)</option>
                <option value="tamil">தமிழ் (Tamil)</option>
              </select>
            ) : (
              <div className="flex items-center space-x-3 py-2">
                <Globe size={18} className="text-gray-400" />
                <span className="text-gray-900 capitalize">{user.preferences.language}</span>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Method
            </label>
            {editMode ? (
              <select
                value={formData.notificationMethod}
                onChange={(e) => setFormData({...formData, notificationMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="email">Email Only</option>
                <option value="sms">SMS Only</option>
                <option value="both">Both Email & SMS</option>
              </select>
            ) : (
              <div className="flex items-center space-x-3 py-2">
                <Bell size={18} className="text-gray-400" />
                <span className="text-gray-900 capitalize">
                  {user.preferences.notificationMethod === 'both' ? 'Email & SMS' : user.preferences.notificationMethod}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      {editMode && (
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Check size={20} />
            <span>Save Changes</span>
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <X size={20} />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {/* Account Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
        
        <div className="space-y-3">
          <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Change Password</span>
              <span className="text-gray-400">›</span>
            </div>
          </button>
          
          <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Privacy Settings</span>
              <span className="text-gray-400">›</span>
            </div>
          </button>
          
          <button className="w-full text-left p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
            <span className="text-red-600">Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};