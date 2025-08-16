import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Shield, 
  Clock,
  Database,
  Server
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SystemSettings {
  general: {
    systemName: string;
    systemDescription: string;
    systemVersion: string;
    systemLogo: string;
    timezone: string;
    defaultLanguage: string;
    supportedLanguages: string[];
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
  };
  appointment: {
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    defaultAppointmentDuration: number;
    allowRescheduling: boolean;
    rescheduleLimit: number;
    cancellationDeadlineHours: number;
    autoConfirmAppointments: boolean;
    reminderNotifications: boolean;
    reminderHoursBefore: number[];
  };
  notification: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    emailProvider: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPassword: string;
  };
  security: {
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSymbols: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    twoFactorAuth: boolean;
    ipWhitelisting: boolean;
    auditLogging: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    backupRetention: number;
    backupLocation: string;
    lastBackup: Date;
  };
  performance: {
    cacheEnabled: boolean;
    cacheDuration: number;
    compressionEnabled: boolean;
    rateLimiting: boolean;
    rateLimit: number;
    rateLimitWindow: number;
  };
}

export const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      systemName: 'GOVCONNECT',
      systemDescription: 'Sri Lanka Government Services Portal',
      systemVersion: '1.0.0',
      systemLogo: '/assets/logo.png',
      timezone: 'Asia/Colombo',
      defaultLanguage: 'english',
      supportedLanguages: ['english', 'sinhala', 'tamil'],
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true
    },
    appointment: {
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      defaultAppointmentDuration: 30,
      allowRescheduling: true,
      rescheduleLimit: 3,
      cancellationDeadlineHours: 24,
      autoConfirmAppointments: false,
      reminderNotifications: true,
      reminderHoursBefore: [24, 2]
    },
    notification: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      emailProvider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: '',
      smtpPassword: ''
    },
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      twoFactorAuth: false,
      ipWhitelisting: false,
      auditLogging: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      backupLocation: 'local',
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    performance: {
      cacheEnabled: true,
      cacheDuration: 300,
      compressionEnabled: true,
      rateLimiting: true,
      rateLimit: 100,
      rateLimitWindow: 15
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
      
      if (response.data.success && response.data.data) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...response.data.data
        }));
      }
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
    { id: 'appointment', label: 'Appointments', icon: Clock },
    { id: 'notification', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'performance', label: 'Performance', icon: Server }
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
                        value={settings.general.systemName || ''}
                        onChange={(e) => updateSettings('general', 'systemName', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Version
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.general.systemVersion || ''}
                        onChange={(e) => updateSettings('general', 'systemVersion', e.target.value)}
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
                                              value={settings.general.systemDescription || ''}
                      onChange={(e) => updateSettings('general', 'systemDescription', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.general.maintenanceMode || false}
                        onChange={(e) => updateSettings('general', 'maintenanceMode', e.target.checked)}
                      />
                      <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                        Maintenance Mode
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="registrationEnabled"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.general.registrationEnabled || false}
                        onChange={(e) => updateSettings('general', 'registrationEnabled', e.target.checked)}
                      />
                      <label htmlFor="registrationEnabled" className="text-sm font-medium text-gray-700">
                        Allow New Registrations
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointment Settings */}
              {activeTab === 'appointment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Appointment Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Advance Booking Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.appointment.maxAdvanceBookingDays || 30}
                        onChange={(e) => updateSettings('appointment', 'maxAdvanceBookingDays', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Advance Booking Hours
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="48"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.appointment.minAdvanceBookingHours || 2}
                        onChange={(e) => updateSettings('appointment', 'minAdvanceBookingHours', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="240"
                        step="15"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.appointment.defaultAppointmentDuration || 30}
                        onChange={(e) => updateSettings('appointment', 'defaultAppointmentDuration', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reschedule Limit
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.appointment.rescheduleLimit || 3}
                        onChange={(e) => updateSettings('appointment', 'rescheduleLimit', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cancellation Deadline (hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.appointment.cancellationDeadlineHours || 24}
                        onChange={(e) => updateSettings('appointment', 'cancellationDeadlineHours', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowRescheduling"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.appointment.allowRescheduling || false}
                        onChange={(e) => updateSettings('appointment', 'allowRescheduling', e.target.checked)}
                      />
                      <label htmlFor="allowRescheduling" className="text-sm font-medium text-gray-700">
                        Allow Rescheduling
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoConfirmAppointments"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.appointment.autoConfirmAppointments || false}
                        onChange={(e) => updateSettings('appointment', 'autoConfirmAppointments', e.target.checked)}
                      />
                      <label htmlFor="autoConfirmAppointments" className="text-sm font-medium text-gray-700">
                        Auto Confirm Appointments
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="reminderNotifications"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.appointment.reminderNotifications || false}
                        onChange={(e) => updateSettings('appointment', 'reminderNotifications', e.target.checked)}
                      />
                      <label htmlFor="reminderNotifications" className="text-sm font-medium text-gray-700">
                        Send Reminder Notifications
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notification' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.notification.emailNotifications}
                        onChange={(e) => updateSettings('notification', 'emailNotifications', e.target.checked)}
                      />
                      <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                        Email Notifications
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.notification.smsNotifications}
                        onChange={(e) => updateSettings('notification', 'smsNotifications', e.target.checked)}
                      />
                      <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700">
                        SMS Notifications
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="pushNotifications"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.notification.pushNotifications}
                        onChange={(e) => updateSettings('notification', 'pushNotifications', e.target.checked)}
                      />
                      <label htmlFor="pushNotifications" className="text-sm font-medium text-gray-700">
                        Push Notifications
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.notification.smtpHost || ''}
                        onChange={(e) => updateSettings('notification', 'smtpHost', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.notification.smtpPort || 587}
                        onChange={(e) => updateSettings('notification', 'smtpPort', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.notification.smtpUser || ''}
                        onChange={(e) => updateSettings('notification', 'smtpUser', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.notification.smtpPassword === '[HIDDEN]' ? '' : settings.notification.smtpPassword || ''}
                        onChange={(e) => updateSettings('notification', 'smtpPassword', e.target.value)}
                        placeholder={settings.notification.smtpPassword === '[HIDDEN]' ? 'Password hidden' : ''}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                      id="smtpSecure"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                      checked={settings.notification.smtpSecure || false}
                      onChange={(e) => updateSettings('notification', 'smtpSecure', e.target.checked)}
                      />
                    <label htmlFor="smtpSecure" className="text-sm font-medium text-gray-700">
                      Use Secure Connection (SSL/TLS)
                      </label>
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
                        value={settings.security.sessionTimeout || 24}
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
                        value={settings.security.passwordMinLength || 8}
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
                        value={settings.security.maxLoginAttempts || 5}
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
                        value={settings.security.lockoutDuration || 30}
                        onChange={(e) => updateSettings('security', 'lockoutDuration', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="passwordRequireUppercase"
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                      checked={settings.security.passwordRequireUppercase || false}
                      onChange={(e) => updateSettings('security', 'passwordRequireUppercase', e.target.checked)}
                    />
                    <label htmlFor="passwordRequireUppercase" className="text-sm font-medium text-gray-700">
                      Require Uppercase Letters
                    </label>
                  </div>
                </div>
              )}



              {/* Backup Settings */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Backup & Recovery</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoBackup"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.backup.autoBackup || false}
                        onChange={(e) => updateSettings('backup', 'autoBackup', e.target.checked)}
                      />
                      <label htmlFor="autoBackup" className="text-sm font-medium text-gray-700">
                        Enable Auto Backup
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.backup.backupFrequency || 'daily'}
                        onChange={(e) => updateSettings('backup', 'backupFrequency', e.target.value)}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retention Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.backup.backupRetention || 30}
                        onChange={(e) => updateSettings('backup', 'backupRetention', parseInt(e.target.value))}
                      />
                    </div>
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Backup
                      </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                      {settings.backup.lastBackup ? new Date(settings.backup.lastBackup).toLocaleString() : 'Never'}
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Settings */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Performance Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="cacheEnabled"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.performance.cacheEnabled || false}
                        onChange={(e) => updateSettings('performance', 'cacheEnabled', e.target.checked)}
                      />
                      <label htmlFor="cacheEnabled" className="text-sm font-medium text-gray-700">
                        Enable Caching
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="compressionEnabled"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.performance.compressionEnabled || false}
                        onChange={(e) => updateSettings('performance', 'compressionEnabled', e.target.checked)}
                      />
                      <label htmlFor="compressionEnabled" className="text-sm font-medium text-gray-700">
                        Enable Compression
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="rateLimiting"
                        className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        checked={settings.performance.rateLimiting || false}
                        onChange={(e) => updateSettings('performance', 'rateLimiting', e.target.checked)}
                      />
                      <label htmlFor="rateLimiting" className="text-sm font-medium text-gray-700">
                        Enable Rate Limiting
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cache Duration (seconds)
                      </label>
                      <input
                        type="number"
                        min="60"
                        max="3600"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.performance.cacheDuration || 300}
                        onChange={(e) => updateSettings('performance', 'cacheDuration', parseInt(e.target.value))}
                      />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Limit (requests/window)
                    </label>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.performance.rateLimit || 100}
                        onChange={(e) => updateSettings('performance', 'rateLimit', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Limit Window (minutes)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="60"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        value={settings.performance.rateLimitWindow || 15}
                        onChange={(e) => updateSettings('performance', 'rateLimitWindow', parseInt(e.target.value))}
                    />
                    </div>
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
