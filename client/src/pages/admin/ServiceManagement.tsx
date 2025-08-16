import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Building2, 
  DollarSign,
  Clock,
  Search,
  Save,
  X,
  Calendar,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Service {
  _id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  processingTime: {
    estimatedDays: number;
    description: string;
  };
  fees: {
    amount: number;
    currency: string;
    description: string;
  };
  requiredDocuments: string[];
  appointmentDuration: number;
  maxAdvanceBookingDays: number;
  isActive: boolean;
  createdAt: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
}

export const ServiceManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'licensing',
    department: '',
    processingTime: {
      estimatedDays: 1,
      description: ''
    },
    fees: {
      amount: 0,
      currency: 'LKR',
      description: ''
    },
    requiredDocuments: [''],
    appointmentDuration: 30,
    maxAdvanceBookingDays: 30,
    isActive: true
  });

  const categories = [
    'licensing',
    'registration',
    'certification',
    'permits',
    'applications',
    'renewals',
    'other'
  ];

  useEffect(() => {
    fetchServices();
    fetchDepartments();
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

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('govconnect_token');
      const response = await axios.get(`${API_BASE_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('govconnect_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Filter out empty required documents
      const filteredFormData = {
        ...formData,
        requiredDocuments: formData.requiredDocuments.filter(doc => doc.trim() !== '')
      };

      if (editingService) {
        // Update existing service
        await axios.put(`${API_BASE_URL}/services/${editingService._id}`, filteredFormData, { headers });
      } else {
        // Create new service
        await axios.post(`${API_BASE_URL}/services`, filteredFormData, { headers });
      }

      fetchServices();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      code: service.code || '',
      description: service.description || '',
      category: service.category || 'licensing',
      department: service.department?._id || '',
      processingTime: {
        estimatedDays: service.processingTime?.estimatedDays || 1,
        description: service.processingTime?.description || ''
      },
      fees: {
        amount: service.fees?.amount || 0,
        currency: service.fees?.currency || 'LKR',
        description: service.fees?.description || ''
      },
      requiredDocuments: Array.isArray(service.requiredDocuments) && service.requiredDocuments.length > 0 
        ? [...service.requiredDocuments] 
        : [''],
      appointmentDuration: service.appointmentDuration || 30,
      maxAdvanceBookingDays: service.maxAdvanceBookingDays || 30,
      isActive: typeof service.isActive === 'boolean' ? service.isActive : true
    });
    setShowModal(true);
  };

  const handleDelete = async (service: Service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedService) return;

    try {
      const token = localStorage.getItem('govconnect_token');
      await axios.delete(`${API_BASE_URL}/services/${selectedService._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
      setShowDeleteModal(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    setSelectedService(service);
    setShowDeactivateModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedService) return;

    try {
      const token = localStorage.getItem('govconnect_token');
      await axios.patch(`${API_BASE_URL}/services/${selectedService._id}`, 
        { isActive: !selectedService.isActive }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchServices();
      setShowDeactivateModal(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'licensing',
      department: '',
      processingTime: {
        estimatedDays: 1,
        description: ''
      },
      fees: {
        amount: 0,
        currency: 'LKR',
        description: ''
      },
      requiredDocuments: [''],  // Initialize with one empty document field
      appointmentDuration: 30,
      maxAdvanceBookingDays: 30,
      isActive: true
    });
    setEditingService(null);
  };

  const addRequiredDocument = () => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: Array.isArray(prev.requiredDocuments) 
        ? [...prev.requiredDocuments, '']
        : ['']
    }));
  };

  const removeRequiredDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: Array.isArray(prev.requiredDocuments)
        ? prev.requiredDocuments.filter((_, i) => i !== index)
        : ['']
    }));
  };

  const updateRequiredDocument = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: Array.isArray(prev.requiredDocuments)
        ? prev.requiredDocuments.map((doc, i) => i === index ? value : doc)
        : [value]
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'licensing': return 'bg-blue-100 text-blue-800';
      case 'registration': return 'bg-green-100 text-green-800';
      case 'certification': return 'bg-purple-100 text-purple-800';
      case 'permits': return 'bg-orange-100 text-orange-800';
      case 'applications': return 'bg-indigo-100 text-indigo-800';
      case 'renewals': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatProcessingTime = (processingTime: { estimatedDays: number; description: string }) => {
    const days = processingTime.estimatedDays;
    return `${days === 1 ? '1 day' : `${days} days`}${processingTime.description ? ` - ${processingTime.description}` : ''}`;
  };

  const formatFees = (fees: { amount: number; currency: string; description: string }) => {
    return fees.amount === 0 
      ? 'Free' 
      : `${fees.currency} ${fees.amount.toLocaleString()}${fees.description ? ` - ${fees.description}` : ''}`;
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    const matchesDepartment = filterDepartment === 'all' || service.department._id === filterDepartment;
    return matchesSearch && matchesCategory && matchesDepartment;
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
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Service Management</h1>
              <p className="opacity-90">Manage government services and their details</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Service</span>
            </button>
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
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">Code: {service.code}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                      {service.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>

                {/* Department */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Building2 size={16} />
                  <span>{service.department.name}</span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock size={16} />
                    <span>{formatProcessingTime(service.processingTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <DollarSign size={16} />
                    <span>{formatFees(service.fees)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar size={16} />
                    <span>{service.appointmentDuration} min</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText size={16} />
                    <span>{service.requiredDocuments.length} docs</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleStatus(service)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      service.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-500">No services found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Code
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Category and Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Processing Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processing Time
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={formData.processingTime.estimatedDays}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        processingTime: {
                          ...prev.processingTime,
                          estimatedDays: parseInt(e.target.value)
                        }
                      }))}
                    />
                    <input
                      type="text"
                      placeholder="Description (e.g., 'Standard processing time')"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={formData.processingTime.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        processingTime: {
                          ...prev.processingTime,
                          description: e.target.value
                        }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Fees
                  </label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.fees.amount}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          fees: {
                            ...prev.fees,
                            amount: parseInt(e.target.value)
                          }
                        }))}
                      />
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={formData.fees.currency}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          fees: {
                            ...prev.fees,
                            currency: e.target.value
                          }
                        }))}
                      >
                        <option value="LKR">LKR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Description (e.g., 'Standard fee for processing')"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={formData.fees.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        fees: {
                          ...prev.fees,
                          description: e.target.value
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.appointmentDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointmentDuration: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.maxAdvanceBookingDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAdvanceBookingDays: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Documents
                </label>
                <div className="space-y-2">
                  {formData.requiredDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter required document"
                        value={doc}
                        onChange={(e) => updateRequiredDocument(index, e.target.value)}
                      />
                      {formData.requiredDocuments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequiredDocument(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequiredDocument}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    + Add Document
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Service is active
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Save size={20} />
                  <span>{editingService ? 'Update' : 'Create'} Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Service</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the service "{selectedService.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedService(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 size={20} />
                <span>Delete Service</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedService.isActive ? 'Deactivate' : 'Activate'} Service
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {selectedService.isActive ? 'deactivate' : 'activate'} the service "{selectedService.name}"?
              {selectedService.isActive 
                ? ' This will prevent citizens from booking new appointments for this service.'
                : ' This will allow citizens to book new appointments for this service.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setSelectedService(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStatus}
                className={`px-4 py-2 ${
                  selectedService.isActive 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-lg transition-colors flex items-center space-x-2`}
              >
                {selectedService.isActive ? (
                  <>
                    <X size={20} />
                    <span>Deactivate Service</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Activate Service</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
