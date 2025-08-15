import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Download,
  QrCode,
  Star
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
    fees: {
      amount: number;
      currency: string;
    };
    processingTime: {
      estimatedDays: number;
    };
    requiredDocuments: Array<{
      name: string;
      description: string;
      isMandatory: boolean;
    }>;
  };
  department: {
    name: string;
    location: {
      address: string;
      city: string;
      district: string;
    };
    contactInfo: {
      phone: string;
    };
    workingHours: any;
  };
  citizen: {
    firstName: string;
    lastName: string;
    nic: string;
    email: string;
    phoneNumber: string;
  };
  notes: {
    citizen?: string;
    officer?: string;
  };
  qrCode?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const AppointmentDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const isNewBooking = location.state?.newBooking;

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/${id}`);
      setAppointment(response.data.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancellationReason.trim()) return;

    setCancelLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/appointments/${id}/cancel`, {
        cancellationReason
      });
      
      // Refresh appointment data
      await fetchAppointment();
      setShowCancelDialog(false);
      setCancellationReason('');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'completed': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200';
      case 'no_show': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={20} />;
      case 'pending': return <Clock size={20} />;
      case 'completed': return <CheckCircle size={20} />;
      case 'cancelled': return <AlertCircle size={20} />;
      case 'no_show': return <AlertCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const canCancel = () => {
    if (!appointment) return false;
    const aptDate = new Date(appointment.appointmentDate);
    const now = new Date();
    return aptDate >= now && ['pending', 'confirmed'].includes(appointment.status);
  };

  const downloadQR = () => {
    if (!appointment?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = appointment.qrCode;
    link.download = `appointment-${appointment.appointmentNumber}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Not Found</h2>
        <p className="text-gray-600">The requested appointment could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Message for New Bookings */}
      {isNewBooking && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Appointment Booked Successfully!</h3>
              <p className="text-green-700">Your appointment has been confirmed. Please save your appointment details and QR code.</p>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{appointment.service?.name || 'Service Unavailable'}</h1>
            <p className="text-gray-600 mb-4">{appointment.service?.description || 'No description available'}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Appointment #</span>
              <span className="font-mono font-medium text-gray-900">{appointment.appointmentNumber}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(appointment.status)}`}>
              {getStatusIcon(appointment.status)}
              <span className="font-medium capitalize">{appointment.status}</span>
            </div>
            {appointment.qrCode && (
              <button
                onClick={() => setShowQR(!showQR)}
                className="mt-3 block bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <QrCode size={16} className="inline mr-2" />
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </button>
            )}
          </div>
        </div>

        {/* QR Code Display */}
        {showQR && appointment.qrCode && (
          <div className="border-t pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment QR Code</h3>
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img 
                  src={appointment.qrCode} 
                  alt="Appointment QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <div className="mt-4 space-x-3">
                <button
                  onClick={downloadQR}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Download size={16} className="inline mr-2" />
                  Download QR Code
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Show this QR code at your appointment for quick check-in
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Appointment Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar size={20} />
            <span>Appointment Details</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{appointment.appointmentTime}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">~{appointment.service?.processingTime?.estimatedDays || 'N/A'} days</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Fee:</span>
              <span className="font-medium">LKR {appointment.service?.fees?.amount?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Booked:</span>
              <span className="font-medium">{new Date(appointment.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Department Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPin size={20} />
            <span>Location & Contact</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Department:</p>
              <p className="font-medium">{appointment.department?.name || 'Department Unavailable'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Address:</p>
              <p className="font-medium">{appointment.department?.location?.address || 'Address Unavailable'}</p>
              <p className="font-medium">{appointment.department?.location?.city || 'City'}, {appointment.department?.location?.district || 'District'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Phone:</p>
              <a 
                href={`tel:${appointment.department?.contactInfo?.phone || ''}`}
                className="font-medium text-primary-600 hover:text-primary-700 flex items-center space-x-1"
              >
                <Phone size={16} />
                <span>{appointment.department?.contactInfo?.phone || 'Phone Unavailable'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <FileText size={20} />
          <span>Required Documents</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {appointment.service?.requiredDocuments?.map((doc, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <CheckCircle size={18} className={doc.isMandatory ? 'text-red-500' : 'text-yellow-500'} />
              <div>
                <p className="font-medium text-gray-900">
                  {doc.name} {doc.isMandatory && <span className="text-red-500">*</span>}
                </p>
                <p className="text-sm text-gray-600">{doc.description}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-red-600 mt-4">* Please bring original documents to your appointment</p>
      </div>

      {/* Notes */}
      {(appointment.notes?.citizen || appointment.notes?.officer) && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Notes</h3>
          <div className="space-y-4">
            {appointment.notes?.citizen && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Your Notes:</p>
                <p className="text-blue-800">{appointment.notes.citizen}</p>
              </div>
            )}
            {appointment.notes?.officer && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-2">Officer Notes:</p>
                <p className="text-green-800">{appointment.notes.officer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {canCancel() && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Actions</h3>
          <button
            onClick={() => setShowCancelDialog(true)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Cancel Appointment
          </button>
        </div>
      )}

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for cancelling this appointment:</p>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-4"
              placeholder="Reason for cancellation..."
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancellationReason.trim() || cancelLoading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};