import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  Building2,
  Users,
  Calendar,
  Info
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Service {
  _id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  processingTime: number;
  fees: number;
  requiredDocuments: Array<{
    _id?: string;
    name: string;
    description?: string;
    isMandatory?: boolean;
    acceptedFormats?: string[];
  }>;
  maxAdvanceBookingDays: number;
  appointmentDuration: number;
  isActive: boolean;
  department: {
    _id: string;
    name: string;
    code: string;
    location: {
      address?: string;
      city?: string;
      district?: string;
      province?: string;
    };
    contactInfo?: {
      phone?: string;
      email?: string;
      website?: string;
    };
  };
}

export const OfficerServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('govconnect_token');
      const response = await axios.get(`${API_BASE_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatProcessingTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    }
  };

  const formatFees = (amount: number) => {
    return amount === 0 ? 'Free' : `Rs. ${amount.toLocaleString()}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'licensing': return 'bg-blue-100 text-blue-800';
      case 'registration': return 'bg-green-100 text-green-800';
      case 'certification': return 'bg-purple-100 text-purple-800';
      case 'permits': return 'bg-orange-100 text-orange-800';
      case 'applications': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Department Services</h1>
          <p className="opacity-90">View and manage available government services</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedService(service);
                setShowModal(true);
              }}
            >
              <div className="p-6">
                {/* Service Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="text-purple-600" size={20} />
                      <span className="font-bold text-gray-900">{service.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Code: {service.code}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                      {service.category}
                    </span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${service.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>

                {/* Service Description */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>

                {/* Service Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock size={16} />
                      <span>Processing Time</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatProcessingTime(service.processingTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <DollarSign size={16} />
                      <span>Fees</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatFees(service.fees)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar size={16} />
                      <span>Appointment Duration</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {service.appointmentDuration} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building2 size={16} />
                      <span>Department</span>
                    </div>
                    <span className="font-medium text-gray-900 text-right">
                      {service.department.name}
                    </span>
                  </div>
                </div>

                {/* Required Documents Count */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Required Documents</span>
                    <span className="font-medium text-gray-900">
                      {service.requiredDocuments.length} items
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-500">No services found</p>
            <p className="text-sm text-gray-400">Services will appear here when they are added</p>
          </div>
        )}
      </div>

      {/* Service Details Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedService.name}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Code: {selectedService.code}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedService.category)}`}>
                      {selectedService.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedService.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedService.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Info size={18} className="mr-2" />
                  Description
                </h4>
                <p className="text-gray-700">{selectedService.description}</p>
              </div>

              {/* Service Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Service Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock size={18} className="text-blue-600" />
                      <span className="font-medium">Processing Time</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatProcessingTime(selectedService.processingTime)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign size={18} className="text-green-600" />
                      <span className="font-medium">Service Fees</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatFees(selectedService.fees)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar size={18} className="text-purple-600" />
                      <span className="font-medium">Appointment Duration</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedService.appointmentDuration} minutes
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users size={18} className="text-orange-600" />
                      <span className="font-medium">Advance Booking</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedService.maxAdvanceBookingDays} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Department Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Building2 size={18} className="mr-2" />
                  Department Information
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-900">{selectedService.department.name}</p>
                  <p className="text-sm text-blue-700">Code: {selectedService.department.code}</p>
                  <div className="text-sm text-blue-700">
                    <p><strong>Location:</strong></p>
                    {selectedService.department.location?.address && (
                      <p className="ml-2">• {selectedService.department.location.address}</p>
                    )}
                    {selectedService.department.location?.city && (
                      <p className="ml-2">• {selectedService.department.location.city}</p>
                    )}
                    {selectedService.department.location?.district && (
                      <p className="ml-2">• {selectedService.department.location.district}</p>
                    )}
                    {selectedService.department.location?.province && (
                      <p className="ml-2">• {selectedService.department.location.province}</p>
                    )}
                  </div>
                  {selectedService.department.contactInfo?.phone && (
                    <p className="text-sm text-blue-700 mt-2">
                      <strong>Phone:</strong> {selectedService.department.contactInfo.phone}
                    </p>
                  )}
                  {selectedService.department.contactInfo?.email && (
                    <p className="text-sm text-blue-700">
                      <strong>Email:</strong> {selectedService.department.contactInfo.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Required Documents</h4>
                {selectedService.requiredDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedService.requiredDocuments.map((document, index) => (
                      <div key={document._id || index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">
                            <FileText size={18} className="text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">{document.name}</p>
                              {document.isMandatory && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                  Required
                                </span>
                              )}
                            </div>
                            {document.description && (
                              <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                            )}
                            {document.acceptedFormats && document.acceptedFormats.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700">Accepted Formats:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {document.acceptedFormats.map((format, idx) => (
                                    <span 
                                      key={idx}
                                      className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                                    >
                                      {format}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No specific documents required</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
