import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Shield, 
  Globe, 
  Clock,
  Mail,
  Phone,
  Database,
  Server,
  Key
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SystemSettings {
  general: {
    systemName: string;
    systemDescription: string;
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    maxAppointmentsPerUser: number;
    defaultAppointmentDuration: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    reminderHours: number;
    adminNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  appointment: {
    advanceBookingDays: number;
    cancellationDeadline: number;
    rescheduleLimit: number;
    autoConfirmation: boolean;
  };
  contact: {
    supportEmail: string;
    supportPhone: string;
    address: string;
    workingHours: string;
  };
}

export const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      systemName: 'GOVCONNECT',
      systemDescription: 'Government Service Appointment System',
      maintenanceMode: false,
      allowRegistrations: true,
      maxAppointmentsPerUser: 5,
      defaultAppointmentDuration: 30
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      reminderHours: 24,
      adminNotifications: true
    },
    security: {
      sessionTimeout: 60,
      passwordMinLength: 6,
      requireEmailVerification: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15
    },
    appointment: {
      advanceBookingDays: 30,
      cancellationDeadline: 2,
      rescheduleLimit: 3,
      autoConfirmation: false
    },
    contact: {
      supportEmail: 'support@govconnect.lk',
      supportPhone: '011-1234567',
      address: 'Government Office Complex, Colombo 01',
      workingHours: 'Monday - Friday: 8:30 AM - 4:30 PM'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('govconnect_token');
      const response = await axios.get(`${API_BASE_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default settings if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('govconnect_token');
      await axios.put(`${API_BASE_URL}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to default values?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('govconnect_token');
      await axios.post(`${API_BASE_URL}/admin/settings/reset`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchSettings();
      setMessage({ type: 'success', text: 'Settings reset to default values!' });
    } catch (error) {
      console.error('Error resetting settings:', error);
      setMessage({ type: 'error', text: 'Failed to reset settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appointment', label: 'Appointments', icon: Clock },
    { id: 'contact', label: 'Contact', icon: Phone }
  ];

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">System Settings</h1>
              <p className="opacity-90">Configure system-wide settings and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetSettings}
                disabled={loading}
                className="bg-white text-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <RefreshCw size={20} />
                <span>Reset</span>
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-white text-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Save size={20} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-md p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.general.systemName}
                        onChange={(e) => updateSettings('general', 'systemName', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Appointments per User
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.general.maxAppointmentsPerUser}
                        onChange={(e) => updateSettings('general', 'maxAppointmentsPerUser', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={settings.general.systemDescription}
                      onChange={(e) => updateSettings('general', 'systemDescription', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => updateSettings('general', 'maintenanceMode', e.target.checked)}
                      />
                      <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                        Maintenance Mode
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowRegistrations"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.general.allowRegistrations}
                        onChange={(e) => updateSettings('general', 'allowRegistrations', e.target.checked)}
                      />
                      <label htmlFor="allowRegistrations" className="text-sm font-medium text-gray-700">
                        Allow New Registrations
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="emailEnabled"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.notifications.emailEnabled}
                        onChange={(e) => updateSettings('notifications', 'emailEnabled', e.target.checked)}
                      />
                      <label htmlFor="emailEnabled" className="text-sm font-medium text-gray-700">
                        Enable Email Notifications
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="smsEnabled"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.notifications.smsEnabled}
                        onChange={(e) => updateSettings('notifications', 'smsEnabled', e.target.checked)}
                      />
                      <label htmlFor="smsEnabled" className="text-sm font-medium text-gray-700">
                        Enable SMS Notifications
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reminder Hours Before Appointment
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.notifications.reminderHours}
                        onChange={(e) => updateSettings('notifications', 'reminderHours', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-8">
                      <input
                        type="checkbox"
                        id="adminNotifications"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.notifications.adminNotifications}
                        onChange={(e) => updateSettings('notifications', 'adminNotifications', e.target.checked)}
                      />
                      <label htmlFor="adminNotifications" className="text-sm font-medium text-gray-700">
                        Admin Notifications
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="480"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        min="6"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lockout Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.security.lockoutDuration}
                        onChange={(e) => updateSettings('security', 'lockoutDuration', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="requireEmailVerification"
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                      checked={settings.security.requireEmailVerification}
                      onChange={(e) => updateSettings('security', 'requireEmailVerification', e.target.checked)}
                    />
                    <label htmlFor="requireEmailVerification" className="text-sm font-medium text-gray-700">
                      Require Email Verification for New Users
                    </label>
                  </div>
                </div>
              )}

              {/* Appointment Settings */}
              {activeTab === 'appointment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Appointment Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Advance Booking Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.appointment.advanceBookingDays}
                        onChange={(e) => updateSettings('appointment', 'advanceBookingDays', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cancellation Deadline (hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="72"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.appointment.cancellationDeadline}
                        onChange={(e) => updateSettings('appointment', 'cancellationDeadline', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reschedule Limit per Appointment
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.appointment.rescheduleLimit}
                        onChange={(e) => updateSettings('appointment', 'rescheduleLimit', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-8">
                      <input
                        type="checkbox"
                        id="autoConfirmation"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.appointment.autoConfirmation}
                        onChange={(e) => updateSettings('appointment', 'autoConfirmation', e.target.checked)}
                      />
                      <label htmlFor="autoConfirmation" className="text-sm font-medium text-gray-700">
                        Auto-confirm Appointments
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Settings */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.contact.supportEmail}
                        onChange={(e) => updateSettings('contact', 'supportEmail', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.contact.supportPhone}
                        onChange={(e) => updateSettings('contact', 'supportPhone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Office Address
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={settings.contact.address}
                      onChange={(e) => updateSettings('contact', 'address', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Hours
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={settings.contact.workingHours}
                      onChange={(e) => updateSettings('contact', 'workingHours', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
