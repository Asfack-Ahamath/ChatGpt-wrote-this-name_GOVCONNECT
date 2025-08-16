import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  FileText, 
  Building2,
  Search,
  Eye,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface PendingAppointment {
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
    processingTime: {
      estimatedDays: number;
      description: string;
    };
    fees: {
      amount: number;
      currency: string;
      description: string;
    };
  };
  department: {
    _id: string;
    name: string;
    code: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes: {
    citizen?: string;
    officer?: string;
  };
  documents: Array<{
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export const PendingApprovals = () => {
  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<PendingAppointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState(false);

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const token = localStorage.getItem('govconnect_token');
      
      // Fetch real data from the new admin appointments endpoint
      const response = await axios.get(`${API_BASE_URL}/admin/appointments?status=pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const pendingAppointments = response.data?.data || [];
      console.log('Fetched pending appointments:', pendingAppointments);
      
      if (pendingAppointments.length > 0) {
        // Use real data and add priority field
        const appointmentsWithPriority = pendingAppointments.map((apt: any) => ({
          ...apt,
          priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
          // Ensure required fields exist with safe fallbacks
          citizen: apt.citizen || { firstName: 'Unknown', lastName: 'User', email: '', phoneNumber: '', nic: '' },
          service: apt.service || { name: 'Unknown Service', code: '', processingTime: 0, fees: 0 },
          department: apt.department || { name: 'Unknown Department', code: '' },
          documents: apt.documents || [],
          notes: apt.notes || {},
          appointmentNumber: apt.appointmentNumber || `APT-${apt._id?.slice(-6) || '000000'}`
        }));
        
        setAppointments(appointmentsWithPriority);
        console.log('Set real appointments:', appointmentsWithPriority);
        return;
      }
      
      // If no pending appointments, show empty state
      console.log('No pending appointments found, showing empty state');
      setAppointments([]);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Show empty state if API fails
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId: string) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('govconnect_token');
      
      // Update via API
      const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}`, 
        { status: 'confirmed' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update the UI with the confirmed data
        setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
        setShowModal(false);
        setSelectedAppointment(null);
        
        // Fetch updated pending appointments to refresh the list
        await fetchPendingAppointments();
      } else {
        console.error('API returned error:', response.data);
        alert('Failed to approve appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
      alert('Error approving appointment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = () => {
    if (!selectedAppointment) {
      console.error("No appointment selected");
      return;
    }
    
    // Reset rejection form
    setRejectionReason('');
    setRejectionError(false);
    
    // Switch to rejection mode
    setIsRejecting(true);
    
    // Debug logs to track state changes
    console.log('Switching to rejection mode, isRejecting set to true');
    
    // Force a re-render to ensure the UI updates
    setTimeout(() => {
      const rejectTextarea = document.getElementById('rejectionReason');
      if (rejectTextarea) {
        rejectTextarea.focus();
        console.log('Found and focused rejection textarea');
      } else {
        console.error('Could not find rejection textarea');
      }
    }, 100);
  };

  const handleReject = async (appointmentId: string) => {
    // Check if rejection reason is empty
    if (!rejectionReason.trim()) {
      setRejectionError(true);
      document.getElementById('rejectionReason')?.focus();
      return;
    }
    
    // Clear any previous error
    setRejectionError(false);
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('govconnect_token');
      
      // Update via API with rejection reason
      const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}`, 
        { 
          status: 'cancelled',
          notes: { 
            officer: rejectionReason 
          }
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update the UI with the cancelled data
        setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
        setShowModal(false);
        setIsRejecting(false);
        setSelectedAppointment(null);
        setRejectionReason('');
        
        // Fetch updated pending appointments to refresh the list
        await fetchPendingAppointments();
      } else {
        console.error('API returned error:', response.data);
        alert('Failed to reject appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      alert('Error rejecting appointment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.citizen.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.citizen.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || appointment.priority === filterPriority;
    const matchesDepartment = filterDepartment === 'all' || appointment.department._id === filterDepartment;
    
    return matchesSearch && matchesPriority && matchesDepartment;
  });

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
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Pending Approvals</h1>
              <p className="opacity-90">Review and approve appointment requests</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={20} />
                  <span className="font-semibold">{filteredAppointments.length}</span>
                  <span className="text-sm">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by citizen name, appointment number, or service..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="d1">Department of Motor Traffic</option>
              <option value="d2">Registrar General's Department</option>
              <option value="d3">Immigration and Emigration</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.citizen.firstName} {appointment.citizen.lastName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(appointment.priority)}`}>
                          {appointment.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FileText size={16} />
                          <span>{appointment.service.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building2 size={16} />
                          <span>{appointment.department.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} />
                          <span>{new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                        <span>#{appointment.appointmentNumber}</span>
                        <span>•</span>
                        <span>{appointment.documents.length} documents</span>
                        <span>•</span>
                        <span>Requested {new Date(appointment.createdAt).toLocaleString()}</span>
                      </div>

                      {appointment.notes.citizen && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Citizen Note:</strong> {appointment.notes.citizen}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setIsRejecting(false); // Ensure we start in details view mode
                        setShowModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleApprove(appointment._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={16} className="inline mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setIsRejecting(true); // Directly open in rejection mode
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={16} className="inline mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-500">No pending appointments found</p>
            <p className="text-sm text-gray-400">All appointments are up to date!</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {isRejecting ? 'Reject Appointment' : 'Appointment Details'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setIsRejecting(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Debug info */}
              <div className="text-xs text-gray-400 mb-2">
                Mode: {isRejecting ? 'Rejection Form' : 'Appointment Details'}
              </div>
              
              {!isRejecting ? (
                <>
                  {/* Citizen Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Citizen Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">{selectedAppointment.citizen.firstName} {selectedAppointment.citizen.lastName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">NIC:</span>
                        <p className="font-medium">{selectedAppointment.citizen.nic}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{selectedAppointment.citizen.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium">{selectedAppointment.citizen.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Appointment Time Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Appointment Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Appointment Date:</span>
                        <p className="font-medium">{new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Appointment Time:</span>
                        <p className="font-medium">{selectedAppointment.appointmentTime}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Request Submitted:</span>
                        <p className="font-medium">{new Date(selectedAppointment.createdAt).toLocaleString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Appointment ID:</span>
                        <p className="font-medium">{selectedAppointment.appointmentNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Service Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Service:</span>
                        <p className="font-medium">{selectedAppointment.service.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Department:</span>
                        <p className="font-medium">{selectedAppointment.department.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Processing Time:</span>
                        <p className="font-medium">{selectedAppointment.service.processingTime.estimatedDays} days</p>
                        {selectedAppointment.service.processingTime.description && (
                          <p className="text-xs text-gray-500">{selectedAppointment.service.processingTime.description}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-600">Fees:</span>
                        <p className="font-medium">{selectedAppointment.service.fees.currency} {selectedAppointment.service.fees.amount.toLocaleString()}</p>
                        {selectedAppointment.service.fees.description && (
                          <p className="text-xs text-gray-500">{selectedAppointment.service.fees.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Submitted Documents</h4>
                    <div className="space-y-2">
                      {selectedAppointment.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText size={20} className="text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-gray-500">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Reject button clicked');
                        openRejectModal();
                      }}
                      disabled={processing}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={20} className="inline mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedAppointment._id)}
                      disabled={processing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={20} className="inline mr-1" />
                      Approve
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Rejection Form */}
                  <p className="text-gray-700">
                    Please provide a reason for rejecting this appointment request from {selectedAppointment.citizen.firstName} {selectedAppointment.citizen.lastName}.
                  </p>
                  
                  <div>
                    <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        if (e.target.value.trim()) {
                          setRejectionError(false);
                        }
                      }}
                      placeholder="Please provide a detailed reason for rejection..."
                      className={`w-full px-3 py-2 border ${rejectionError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]`}
                      autoFocus
                    />
                    {rejectionError && (
                      <p className="mt-1 text-sm text-red-600">Please provide a reason for rejection</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setIsRejecting(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleReject(selectedAppointment._id)}
                      disabled={processing || !rejectionReason.trim()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {processing ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
