import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Filter,
  Eye,
  Search,
  ArrowRight,
  Plus
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
  notes: {
    citizen?: string;
    officer?: string;
  };
  createdAt: string;
}

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const timeOptions = [
    { value: '', label: 'All Time' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' }
  ];

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, selectedStatus, selectedTimeFilter, searchTerm]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('govconnect_token');
      const response = await axios.get(`${API_BASE_URL}/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(apt => apt.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by time
    if (selectedTimeFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        
        switch (selectedTimeFilter) {
          case 'upcoming':
            return aptDate >= today;
          case 'past':
            return aptDate < today;
          case 'this_week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return aptDate >= weekStart && aptDate <= weekEnd;
          case 'this_month':
            return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getAppointmentStats = () => {
    const stats = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: appointments.length,
      pending: stats.pending || 0,
      confirmed: stats.confirmed || 0,
      completed: stats.completed || 0,
      cancelled: stats.cancelled || 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white md:bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-500 text-sm">Loading appointments...</p>
        </div>
      </div>
    );
  }

  const stats = getAppointmentStats();

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Mobile Native App Layout */}
      <div className="md:hidden bg-white min-h-screen">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white text-xl font-bold">My Appointments</h1>
              <p className="text-blue-100 text-sm">{stats.total} total appointments</p>
            </div>
            <Link
              to="/services"
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Plus size={20} className="text-white" />
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-white">{stats.pending}</p>
              <p className="text-xs text-blue-100">Pending</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-white">{stats.confirmed}</p>
              <p className="text-xs text-blue-100">Confirmed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-white">{stats.completed}</p>
              <p className="text-xs text-blue-100">Completed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-white">{stats.cancelled}</p>
              <p className="text-xs text-blue-100">Cancelled</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-4 bg-white border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex space-x-2 overflow-x-auto">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === status.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="px-4 py-4">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <Link
                  key={appointment._id}
                  to={`/appointment/${appointment._id}`}
                  className="block bg-gray-50 rounded-2xl p-4 active:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="capitalize">{appointment.status}</span>
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {appointment.service?.name || 'Service Name'}
                      </h3>
                      
                      <p className="text-xs text-gray-500 mb-2">
                        #{appointment.appointmentNumber}
                      </p>
                      
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
                        <div className="flex items-center space-x-1 mt-2">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">
                            {appointment.department.name} • {appointment.department.location?.city}
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
            <div className="text-center py-12">
              <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || selectedStatus ? 'No matching appointments' : 'No appointments yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedStatus 
                  ? 'Try adjusting your search or filters'
                  : 'Book your first government service appointment'
                }
              </p>
              <Link
                to="/services"
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium active:bg-blue-700 transition-colors"
              >
                Browse Services
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6 md:space-y-8 px-4 md:px-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-600">View and manage your government service appointments</p>
          </div>
          <Link
            to="/services"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Book New</span>
          </Link>
        </div>

        {/* Stats Cards - Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
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
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search - Desktop */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
          </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedTimeFilter}
              onChange={(e) => setSelectedTimeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
                {timeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            </div>
          </div>
        </div>

        {/* Appointments List - Desktop */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Appointments ({filteredAppointments.length})
            </h2>
      </div>

          <div className="p-6">
            {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
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
                  
                        <p className="text-sm text-gray-600 mb-2">
                          #{appointment.appointmentNumber}
                        </p>
                        
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
                  
                      <div className="flex items-center space-x-2">
                        <Eye size={16} className="text-gray-400" />
                        <ArrowRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
                </div>
            ) : (
              <div className="text-center py-12">
                <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || selectedStatus ? 'No matching appointments' : 'No appointments yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedStatus 
                    ? 'Try adjusting your search or filters'
                    : 'Book your first government service appointment'
                  }
                </p>
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