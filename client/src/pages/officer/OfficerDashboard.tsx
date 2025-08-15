import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  FileText,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Building2
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface OfficerStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  totalServices: number;
  departmentName: string;
}

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OfficerStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    totalServices: 0,
    departmentName: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficerStats();
  }, []);

  const fetchOfficerStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/officer/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching officer stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Manage Appointments',
      description: 'View and update appointment status',
      icon: Calendar,
      link: '/officer/appointments',
      color: 'bg-blue-500'
    },
    {
      title: 'Today\'s Schedule',
      description: 'View today\'s appointments',
      icon: Clock,
      link: '/officer/appointments?date=today',
      color: 'bg-green-500'
    },
    {
      title: 'Pending Reviews',
      description: 'Review pending appointments',
      icon: AlertCircle,
      link: '/officer/appointments?status=pending',
      color: 'bg-yellow-500'
    },
    {
      title: 'Department Services',
      description: 'View available services',
      icon: FileText,
      link: '/officer/services',
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Officer Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Officer Dashboard
              </h1>
              <p className="text-xl opacity-90">
                Welcome back, {user?.firstName}! Manage appointments for {stats.departmentName}.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <UserCheck size={32} />
              <div>
                <p className="font-semibold">Officer Panel</p>
                <p className="text-sm opacity-80">Appointment Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <Calendar size={16} className="mr-2" />
              <span>Upcoming: {stats.upcomingAppointments}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-yellow-600">
              <Clock size={16} className="mr-2" />
              <span>Require Action</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp size={16} className="mr-2" />
              <span>Successfully Processed</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Building2 size={16} className="mr-2" />
              <span>All Time</span>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Appointment Status Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.confirmedAppointments}</div>
              <div className="text-sm text-blue-700">Confirmed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completedAppointments}</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.cancelledAppointments}</div>
              <div className="text-sm text-red-700">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Department Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Department Information</h3>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{stats.departmentName}</h4>
              <p className="text-gray-600">Managing {stats.totalServices} services</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
