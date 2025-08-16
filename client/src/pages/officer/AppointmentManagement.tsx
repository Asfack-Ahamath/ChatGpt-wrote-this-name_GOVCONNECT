import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { FeedbackDisplay } from '../../components/feedback/FeedbackDisplay';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  UserCheck,
  Edit3,
  Phone,
  Mail,
  MapPin,
  Star
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Appointment {
  _id: string;
  appointmentNumber: string;
  citizen: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nic: string;
  };
  service: {
    _id: string;
    name: string;
    code: string;
    description: string;
    processingTime: number;
    fees: number;
  };
  department: {
    _id: string;
    name: string;
    location: string;
  };
  officer?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  priority: string;
  notes: {
    citizen?: string;
    officer?: string;
    internal?: string;
  };
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
  createdAt: string;
}

interface Officer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const AppointmentManagement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    date: searchParams.get('date') || '',
    search: searchParams.get('search') || ''
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: '',
    officerId: ''
  });

  // Update filters when URL parameters change
  useEffect(() => {
    setFilters({
      status: searchParams.get('status') || '',
      date: searchParams.get('date') || '',
      search: searchParams.get('search') || ''
    });
  }, [searchParams]);
  
  // Function to update URL parameters
  const updateUrlParams = (newFilters: {status: string, date: string, search: string}) => {
    const params = new URLSearchParams();
    if (newFilters.status) params.append('status', newFilters.status);
    if (newFilters.date) params.append('date', newFilters.date);
    if (newFilters.search) params.append('search', newFilters.search);
    
    navigate({
      pathname: '/officer/appointments',
      search: params.toString()
    });
  };

  useEffect(() => {
    fetchAppointments();
    fetchOfficers();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('govconnect_token');
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.date) {
        if (filters.date === 'today') {
          params.append('date', new Date().toISOString().split('T')[0]);
        } else {
          params.append('date', filters.date);
        }
      }
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_BASE_URL}/officer/appointments?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const token = localStorage.getItem('govconnect_token');
      const response = await axios.get(`${API_BASE_URL}/officer/department-officers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOfficers(response.data.data);
    } catch (error) {
      console.error('Error fetching officers:', error);
    }
  };

  const updateAppointmentStatus = async () => {
    if (!selectedAppointment) return;

    try {
      const token = localStorage.getItem('govconnect_token');
      await axios.patch(
        `${API_BASE_URL}/officer/appointments/${selectedAppointment._id}/status`,
        {
          status: statusUpdate.status,
          notes: statusUpdate.notes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Assign officer if specified
      if (statusUpdate.officerId) {
        await axios.patch(
          `${API_BASE_URL}/officer/appointments/${selectedAppointment._id}/assign`,
          { officerId: statusUpdate.officerId },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      fetchAppointments();
      setShowModal(false);
      setStatusUpdate({ status: '', notes: '', officerId: '' });
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      case 'rescheduled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle size={16} />;
      case 'confirmed': return <CheckCircle size={16} />;
      case 'in_progress': return <Clock size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      case 'no_show': return <XCircle size={16} />;
      case 'rescheduled': return <RotateCcw size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {filters.date === 'today' 
                  ? 'Today\'s Schedule' 
                  : filters.status 
                    ? `${filters.status.charAt(0).toUpperCase() + filters.status.slice(1).replace('_', ' ')} Appointments` 
                    : 'Appointment Management'}
              </h1>
              <p className="opacity-90">
                {filters.date === 'today' 
                  ? `Today's appointments - ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                  : filters.status
                    ? `Viewing ${filters.status.replace('_', ' ')} appointments only`
                    : 'Manage and track all citizen appointments'
                }
              </p>
            </div>
            {filters.date === 'today' && (
              <div className="text-right">
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <p className="text-sm opacity-90">Today's Total</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Today's Schedule Quick Stats */}
        {filters.date === 'today' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Today</p>
                  <p className="text-xl font-bold text-gray-900">{appointments.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-gray-900">
                    {appointments.filter(apt => apt.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-gray-900">
                    {appointments.filter(apt => ['pending', 'confirmed'].includes(apt.status)).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-xl font-bold text-gray-900">
                    {appointments.filter(apt => ['cancelled', 'no_show'].includes(apt.status)).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => {
                  const newSearch = e.target.value;
                  setFilters(prev => ({ ...prev, search: newSearch }));
                  updateUrlParams({ ...filters, search: newSearch });
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => {
                const newStatus = e.target.value;
                setFilters(prev => ({ ...prev, status: newStatus }));
                updateUrlParams({ ...filters, status: newStatus });
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
              <option value="rescheduled">Rescheduled</option>
            </select>

            {/* Date Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.date}
              onChange={(e) => {
                const newDate = e.target.value;
                setFilters(prev => ({ ...prev, date: newDate }));
                updateUrlParams({ ...filters, date: newDate });
              }}
            >
              <option value="">All Dates</option>
              <option value="today">Today Only</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilters({ status: '', date: '', search: '' });
                navigate('/officer/appointments');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Filter size={20} className="mr-2" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {filters.date === 'today' ? 'Today\'s Schedule' : filters.status ? `${filters.status.charAt(0).toUpperCase() + filters.status.slice(1).replace('_', ' ')} Appointments` : 'All Appointments'} ({appointments.length})
              </h2>
              {filters.date === 'today' && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>Sorted by appointment time</span>
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">
                  {filters.date === 'today' ? 'No appointments scheduled for today' : 'No appointments found'}
                </p>
                <p className="text-sm">
                  {filters.date === 'today' 
                    ? 'Enjoy your free day! Check back tomorrow for new appointments.' 
                    : 'Try adjusting your filters'
                  }
                </p>
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Appointment Number & Status */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-bold text-gray-900">
                            #{appointment.appointmentNumber}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 capitalize">{appointment.status.replace('_', ' ')}</span>
                          </span>
                          {appointment.feedback?.rating && (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              <Star size={12} fill="currentColor" />
                              <span>{appointment.feedback.rating}/5</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Citizen Info */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <User size={16} />
                            <span>{appointment.citizen?.firstName || 'N/A'} {appointment.citizen?.lastName || ''}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone size={16} />
                            <span>{appointment.citizen?.phoneNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail size={16} />
                            <span>{appointment.citizen?.email || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Service Info */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FileText size={16} />
                            <span>{appointment.service?.name || 'Service Unavailable'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>{formatDate(appointment.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{formatTime(appointment.appointmentTime)}</span>
                          </div>
                        </div>

                        {/* Officer Assignment */}
                        {appointment.officer && (
                          <div className="flex items-center space-x-1 text-sm text-blue-600 mt-2">
                            <UserCheck size={16} />
                            <span>Assigned to: {appointment.officer?.firstName || 'N/A'} {appointment.officer?.lastName || ''}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setStatusUpdate({
                            status: appointment.status,
                            notes: appointment.notes?.officer || '',
                            officerId: appointment.officer?._id || ''
                          });
                          setShowModal(true);
                        }}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-1"
                      >
                        <Edit3 size={16} />
                        <span>Manage</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          // Could open a detailed view modal
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Manage Appointment #{selectedAppointment.appointmentNumber}
              </h3>
              <p className="text-gray-600">
                {selectedAppointment.citizen.firstName} {selectedAppointment.citizen.lastName}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              {/* Officer Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Officer
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusUpdate.officerId}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, officerId: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {officers.map(officer => (
                    <option key={officer._id} value={officer._id}>
                      {officer.firstName} {officer.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Officer Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add notes about this appointment..."
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              {/* Feedback Display */}
              {selectedAppointment.feedback?.rating && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizen Feedback
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            size={16}
                            fill={index + 1 <= selectedAppointment.feedback!.rating ? '#FCD34D' : 'none'}
                            stroke={index + 1 <= selectedAppointment.feedback!.rating ? '#FCD34D' : '#D1D5DB'}
                            strokeWidth={2}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {selectedAppointment.feedback.rating}/5
                      </span>
                      <span className="text-xs text-gray-500">
                        • {new Date(selectedAppointment.feedback.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedAppointment.feedback.comment && (
                      <p className="text-sm text-gray-700 italic">
                        "{selectedAppointment.feedback.comment}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setStatusUpdate({ status: '', notes: '', officerId: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateAppointmentStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
