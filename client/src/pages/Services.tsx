import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Clock, DollarSign, FileText, Grid, List } from 'lucide-react';
import { ChatbotButton } from '../components/chatbot_button';

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Department {
  _id: string;
  name: string;
  nameInSinhala?: string;
  nameInTamil?: string;
  code: string;
  location: {
    city: string;
    district: string;
  };
}

interface Service {
  _id: string;
  name: string;
  nameInSinhala?: string;
  nameInTamil?: string;
  description: string;
  category: string;
  department: Department;
  fees: {
    amount: number;
    currency: string;
  };
  processingTime: {
    estimatedDays: number;
  };
  appointmentDuration: number;
}

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: '', label: 'All', icon: '📋' },
    { value: 'license_permits', label: 'Licenses', icon: '🆔' },
    { value: 'certificates', label: 'Certificates', icon: '📄' },
    { value: 'registration', label: 'Registration', icon: '📝' },
    { value: 'applications', label: 'Applications', icon: '📋' },
    { value: 'renewals', label: 'Renewals', icon: '🔄' },
    { value: 'verification', label: 'Verification', icon: '✅' }
  ];

  const popularServices = [
    { name: 'Driving License', category: 'license_permits', icon: '🚗' },
    { name: 'Passport', category: 'certificates', icon: '📘' },
    { name: 'Birth Certificate', category: 'certificates', icon: '👶' },
    { name: 'NIC Application', category: 'registration', icon: '🆔' }
  ];

  useEffect(() => {
    fetchDepartments();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [searchTerm, selectedDepartment, selectedCategory]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await axios.get(`${API_BASE_URL}/services?${params}`);
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || '📋';
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || category;
  };

  // Filter services based on search and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || service.department._id === selectedDepartment;
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    
    return matchesSearch && matchesDepartment && matchesCategory;
  });

  const getServiceStats = () => {
    const stats = services.reduce((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: services.length,
      categories: Object.keys(stats).length,
      departments: new Set(services.map(s => s.department._id)).size,
      ...stats
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white md:bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-500 text-sm">Loading services...</p>
        </div>
      </div>
    );
  }

  const stats = getServiceStats();

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      {/* Mobile Native App Layout */}
      <div className="md:hidden bg-white min-h-screen">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white text-xl font-bold">Government Services</h1>
              <p className="text-green-100 text-sm">{stats.total} services available</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                {viewMode === 'grid' ? <List size={20} className="text-white" /> : <Grid size={20} className="text-white" />}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Filter size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-white">{stats.categories}</p>
              <p className="text-xs text-green-100">Categories</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-white">{stats.departments}</p>
              <p className="text-xs text-green-100">Departments</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-white">{filteredServices.length}</p>
              <p className="text-xs text-green-100">Available</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-4 bg-white border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Popular Services */}
        {!searchTerm && !selectedCategory && (
          <div className="px-4 py-4 bg-white border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Popular Services</h3>
            <div className="grid grid-cols-2 gap-3">
              {popularServices.map((service, index) => (
                <button
                  key={index}
                  onClick={() => setSearchTerm(service.name)}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 active:scale-95 transition-transform"
                >
                  <div className="text-2xl mb-2">{service.icon}</div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{service.name}</p>
                  <p className="text-xs text-gray-600">Quick access</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setSelectedDepartment('');
                      setSelectedCategory('');
                      setSearchTerm('');
                      setShowFilters(false);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold active:bg-gray-300 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold active:from-green-700 active:to-green-800 transition-all duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="px-4 py-4">
          {filteredServices.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
              {filteredServices.map((service) => (
                <Link
                  key={service._id}
                  to={`/book/${service._id}`}
                  className={`block bg-gray-50 rounded-2xl p-4 active:bg-gray-100 transition-colors ${
                    viewMode === 'grid' ? 'text-center' : ''
                  }`}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <div className="space-y-3">
                      <div className="text-3xl">{getCategoryIcon(service.category)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {service.name}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {service.description}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                          <Clock size={10} />
                          <span>{service.processingTime?.estimatedDays}d</span>
                        </div>
                        <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                          <DollarSign size={10} />
                          <span>Rs. {service.fees?.amount}</span>
                        </div>
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        {getCategoryLabel(service.category)}
                      </div>
                    </div>
                  ) : (
                    // List View
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl flex-shrink-0">{getCategoryIcon(service.category)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin size={12} />
                            <span>{service.department?.location?.city}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{service.processingTime?.estimatedDays} days</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign size={12} />
                            <span>Rs. {service.fees?.amount}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-600 font-medium">
                            {getCategoryLabel(service.category)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {service.department?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory || selectedDepartment
                  ? 'Try adjusting your search or filters'
                  : 'No services are currently available'
                }
              </p>
              {(searchTerm || selectedCategory || selectedDepartment) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedDepartment('');
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-2xl font-medium active:bg-green-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6 md:space-y-8 px-4 md:px-0">
        {/* Header - Desktop */}
        <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Government Services
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Browse and book appointments for various Sri Lankan government services
        </p>
      </div>

        {/* Search and Filters - Desktop */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

        {/* Services Grid - Desktop */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Services ({filteredServices.length})
            </h2>
              </div>

          {filteredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Link
                  key={service._id}
                  to={`/book/${service._id}`}
                  className="block p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{getCategoryIcon(service.category)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {service.name}
              </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                {service.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  <span>{service.department.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  <span>{service.department.location.city}, {service.department.location.district}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock size={16} />
                  <span>{service.processingTime.estimatedDays} days processing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <DollarSign size={16} />
                  <span>LKR {service.fees.amount.toLocaleString()}</span>
                </div>
              </div>

                      <div className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center">
                Book Appointment
                      </div>
                    </div>
                  </div>
              </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Popular Services - Desktop */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularServices.map((serviceName, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
                <div className="text-2xl mb-2">{serviceName.icon}</div>
                <h4 className="font-medium text-gray-900 mb-2">{serviceName.name}</h4>
              <p className="text-sm text-gray-600">Quick access to popular government services</p>
            </div>
          ))}
          </div>
        </div>
      </div>
      {/* Floating Chatbot */}
        <ChatbotButton />
    </div>
  );
};