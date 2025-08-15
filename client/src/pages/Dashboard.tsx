import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  MapPin,
  Bell
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Appointment {
  _id: string;
  appointmentNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  service: {
    name: string;
    description: string;
  };
  department: {
    name: string;
    location: {
      city: string;
    };
  };
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    pending: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('govconnect_token');
      const response = await axios.get(`${API_BASE_URL}/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const appointmentsData = response.data.data || [];
      setAppointments(appointmentsData.slice(0, 3)); // Show only recent 3

      // Calculate stats
      const statsData = appointmentsData.reduce((acc: any, appointment: Appointment) => {
        switch (appointment.status) {
          case 'confirmed':
            acc.upcoming += 1;
            break;
          case 'pending':
            acc.pending += 1;
            break;
          case 'completed':
            acc.completed += 1;
            break;
          case 'cancelled':
            acc.cancelled += 1;
            break;
        }
        return acc;
      }, {
        upcoming: 0,
        completed: 0,
        pending: 0,
        cancelled: 0
      });

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-amber-600 bg-amber-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white md:bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Mobile Native App Layout */}
      <div className="md:hidden">
        {/* Hero Section - Mobile */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-4 pt-4 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-100 text-sm">Good morning</p>
              <h1 className="text-white text-xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Bell size={20} className="text-white" />
            </div>
          </div>

          {/* Quick Stats - Mobile */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar size={16} className="text-white" />
                <span className="text-white/80 text-xs font-medium">Upcoming</span>
              </div>
              <p className="text-white text-2xl font-bold">{stats.upcoming}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock size={16} className="text-white" />
                <span className="text-white/80 text-xs font-medium">Pending</span>
              </div>
              <p className="text-white text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>

          {/* Quick Action Button */}
          <Link
            to="/services"
            className="bg-white text-blue-600 rounded-2xl p-4 flex items-center justify-between shadow-sm active:scale-95 transition-transform"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Plus size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Book Service</p>
                <p className="text-xs text-gray-500">Start new application</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-gray-400" />
          </Link>
        </div>

        {/* Content Section - Mobile */}
        <div className="px-4 py-6 space-y-6">
          {/* Quick Actions Grid */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/services"
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-3">
                  <FileText size={20} className="text-white" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">All Services</p>
                <p className="text-xs text-gray-600">Browse available services</p>
              </Link>

              <Link
                to="/appointments"
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mb-3">
                  <Calendar size={20} className="text-white" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">My Appointments</p>
                <p className="text-xs text-gray-600">View all appointments</p>
              </Link>
            </div>
          </div>

          {/* Recent Appointments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Link 
                to="/appointments" 
                className="text-blue-600 text-sm font-medium active:text-blue-700"
              >
                View All
              </Link>
            </div>

            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <Link
                    key={appointment._id}
                    to={`/appointment/${appointment._id}`}
                    className="bg-gray-50 rounded-2xl p-4 active:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="capitalize">{appointment.status}</span>
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {appointment.service?.name || 'Service Name'}
                        </h3>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{appointment.appointmentTime}</span>
                          </div>
                        </div>
                        
                        {appointment.department?.name && (
                          <div className="flex items-center space-x-1 mt-1">
                            <MapPin size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500 truncate">
                              {appointment.department.name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <ArrowRight size={16} className="text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <Calendar size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">No appointments yet</p>
                <p className="text-gray-500 text-sm mb-4">Start by booking your first service</p>
                <Link
                  to="/services"
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium active:bg-blue-700 transition-colors"
                >
                  Browse Services
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6 md:space-y-8 px-4 md:px-0">
        {/* Welcome Section - Desktop */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-xl opacity-90 mb-6">
          Manage your government service appointments and documents
        </p>
        <Link
          to="/services"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Book New Appointment</span>
        </Link>
      </div>

        {/* Stats Cards - Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
            </div>
          </div>
        </div>
        
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

        {/* Recent Appointments - Desktop */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Appointments</h2>
          <Link
            to="/appointments"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

          <div className="p-6">
            {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
                  <Link
                key={appointment._id}
                    to={`/appointment/${appointment._id}`}
                    className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                    <div className="flex items-center justify-between">
                  <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                            {appointment.service?.name || 'Service Name'}
                      </h3>
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="capitalize">{appointment.status}</span>
                      </span>
                    </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                            <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                          {appointment.department?.name && (
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                              <span>{appointment.department.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ArrowRight size={20} className="text-gray-400" />
                    </div>
                    </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-600 mb-6">Start by booking your first government service</p>
            <Link
              to="/services"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Browse Services</span>
            </Link>
          </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};