import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Search,
  Filter,
  Save,
  X,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  location: {
    address: string;
    city: string;
    district: string;
    province: string;
    postalCode: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      isOpen: boolean;
    };
  };
  isActive: boolean;
  createdAt: string;
}

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    location: {
      address: '',
      city: '',
      district: '',
      province: '',
      postalCode: ''
    },
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    workingHours: {
      monday: { start: '08:30', end: '16:30', isOpen: true },
      tuesday: { start: '08:30', end: '16:30', isOpen: true },
      wednesday: { start: '08:30', end: '16:30', isOpen: true },
      thursday: { start: '08:30', end: '16:30', isOpen: true },
      friday: { start: '08:30', end: '16:30', isOpen: true },
      saturday: { start: '08:30', end: '12:30', isOpen: true },
      sunday: { start: '', end: '', isOpen: false }
    },
    isActive: true
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('govconnect_token');
      const response = await axios.get(`${API_BASE_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('govconnect_token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingDepartment) {
        // Update existing department
        await axios.put(`${API_BASE_URL}/departments/${editingDepartment._id}`, formData, { headers });
      } else {
        // Create new department
        await axios.post(`${API_BASE_URL}/departments`, formData, { headers });
      }

      fetchDepartments();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description,
      location: { ...department.location },
      contactInfo: { ...department.contactInfo },
      workingHours: { ...department.workingHours },
      isActive: department.isActive
    });
    setShowModal(true);
  };

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDepartment) return;

    try {
      const token = localStorage.getItem('govconnect_token');
      await axios.delete(`${API_BASE_URL}/departments/${selectedDepartment._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDepartments();
      setShowDeleteModal(false);
      setSelectedDepartment(null);
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const handleToggleStatus = (department: Department) => {
    setSelectedDepartment(department);
    setShowDeactivateModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedDepartment) return;

    try {
      const token = localStorage.getItem('govconnect_token');
      await axios.patch(`${API_BASE_URL}/departments/${selectedDepartment._id}`, 
        { isActive: !selectedDepartment.isActive }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDepartments();
      setShowDeactivateModal(false);
      setSelectedDepartment(null);
    } catch (error) {
      console.error('Error updating department status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      location: {
        address: '',
        city: '',
        district: '',
        province: '',
        postalCode: ''
      },
      contactInfo: {
        phone: '',
        email: '',
        website: ''
      },
      workingHours: {
        monday: { start: '08:30', end: '16:30', isOpen: true },
        tuesday: { start: '08:30', end: '16:30', isOpen: true },
        wednesday: { start: '08:30', end: '16:30', isOpen: true },
        thursday: { start: '08:30', end: '16:30', isOpen: true },
        friday: { start: '08:30', end: '16:30', isOpen: true },
        saturday: { start: '08:30', end: '12:30', isOpen: true },
        sunday: { start: '', end: '', isOpen: false }
      },
      isActive: true
    });
    setEditingDepartment(null);
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && dept.isActive) ||
                         (filterStatus === 'inactive' && !dept.isActive);
    return matchesSearch && matchesFilter;
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
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Department Management</h1>
              <p className="opacity-90">Manage government departments and their information</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Department</span>
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
                placeholder="Search departments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Departments</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <div key={department._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{department.name}</h3>
                      <p className="text-sm text-gray-600">Code: {department.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      department.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {department.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {department.description}
                </p>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>{department.location.city}, {department.location.district}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} />
                    <span>{department.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail size={16} />
                    <span>{department.contactInfo.email}</span>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Clock size={16} />
                    <span>Working Hours</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Mon-Fri: {department.workingHours.monday.start} - {department.workingHours.monday.end}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleStatus(department)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      department.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {department.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(department)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(department)}
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

        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-500">No departments found</p>
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
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
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
                    Department Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Code
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Location */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.location.address}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, address: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.location.city}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, city: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.location.district}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, district: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.contactInfo.phone}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, phone: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.contactInfo.email}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={formData.contactInfo.website || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contactInfo: { ...prev.contactInfo, website: e.target.value }
                      }))}
                      placeholder="https://example.gov.lk"
                    />
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Working Hours</h4>
                <div className="space-y-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-28">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
                        <input
                          type="time"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={formData.workingHours[day].start}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              [day]: { ...prev.workingHours[day], start: e.target.value }
                            }
                          }))}
                          disabled={!formData.workingHours[day].isOpen}
                        />
                        <input
                          type="time"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={formData.workingHours[day].end}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            workingHours: {
                              ...prev.workingHours,
                              [day]: { ...prev.workingHours[day], end: e.target.value }
                            }
                          }))}
                          disabled={!formData.workingHours[day].isOpen}
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`isOpen_${day}`}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            checked={formData.workingHours[day].isOpen}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day]: {
                                  ...prev.workingHours[day],
                                  isOpen: e.target.checked,
                                  start: e.target.checked ? prev.workingHours[day].start || '08:30' : '',
                                  end: e.target.checked ? prev.workingHours[day].end || '16:30' : ''
                                }
                              }
                            }))}
                          />
                          <label htmlFor={`isOpen_${day}`} className="text-sm text-gray-600">
                            Open
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Department is active
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Save size={20} />
                  <span>{editingDepartment ? 'Update' : 'Create'} Department</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Department</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the department "{selectedDepartment.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDepartment(null);
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
                <span>Delete Department</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedDepartment.isActive ? 'Deactivate' : 'Activate'} Department
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {selectedDepartment.isActive ? 'deactivate' : 'activate'} the department "{selectedDepartment.name}"?
              {selectedDepartment.isActive 
                ? ' This will prevent citizens from booking appointments with this department.'
                : ' This will allow citizens to book appointments with this department.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setSelectedDepartment(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStatus}
                className={`px-4 py-2 ${
                  selectedDepartment.isActive 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white rounded-lg transition-colors flex items-center space-x-2`}
              >
                {selectedDepartment.isActive ? (
                  <>
                    <X size={20} />
                    <span>Deactivate Department</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Activate Department</span>
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
