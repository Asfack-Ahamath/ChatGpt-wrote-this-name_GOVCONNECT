import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  FileText, 
  Clock, 
  Shield, 
  Users, 
  ArrowRight,
  CheckCircle,
  Smartphone,
  Globe
} from 'lucide-react';

import { ChatbotButton } from '../components/chatbot_button';

export const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Online Appointment Booking',
      description: 'Book appointments for government services from the comfort of your home, 24/7.'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Document Pre-submission',
      description: 'Upload required documents beforehand to speed up your visit and reduce wait times.'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Real-time Updates',
      description: 'Get instant notifications about your appointment status via SMS and email.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Verified',
      description: 'Your personal information is protected with bank-level security measures.'
    }
  ];

  const services = [
    {
      title: 'Department of Motor Traffic',
      services: ['Driving License', 'Vehicle Registration', 'Revenue License'],
      icon: '🚗'
    },
    {
      title: 'Immigration & Emigration',
      services: ['Passport Application', 'Visa Services', 'Travel Documents'],
      icon: '✈️'
    },
    {
      title: 'Registrar General',
      services: ['Birth Certificate', 'Marriage Certificate', 'Death Certificate'],
      icon: '📋'
    },
    {
      title: 'National Identity Card',
      services: ['New NIC', 'NIC Replacement', 'Address Change'],
      icon: '🆔'
    }
  ];

  return (
    <div className="space-y-8 md:space-y-16 px-4 md:px-0">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-sri-green via-primary-600 to-sri-orange text-white rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to GOVCONNECT
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your One-Stop Portal for Sri Lankan Government Services
          </p>
          <p className="text-lg mb-8 opacity-80">
            Book appointments, submit documents, and track your applications - all in one place
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/services"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Browse Services
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose GOVCONNECT?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing how Sri Lankan citizens access government services with modern technology and user-friendly design.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="text-primary-600 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-12 bg-white rounded-2xl shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Available Government Services
          </h2>
          <p className="text-xl text-gray-600">
            Access services from major government departments in Sri Lanka
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((dept, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all">
              <div className="text-4xl mb-4">{dept.icon}</div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                {dept.title}
              </h3>
              <ul className="space-y-2">
                {dept.services.map((service, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-500" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link
            to="/services"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
          >
            <span>View All Services</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Simple steps to access government services online
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">1. Register Account</h3>
            <p className="text-gray-600">
              Create your account using your NIC and personal details. Quick and secure registration process.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">2. Book Appointment</h3>
            <p className="text-gray-600">
              Choose your service, select a convenient time slot, and upload required documents.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">3. Visit & Complete</h3>
            <p className="text-gray-600">
              Show your QR code, complete the process quickly, and provide feedback on your experience.
            </p>
          </div>

        {/* Floating Chatbot */}
          <ChatbotButton />
        </div>
      </section>

      {/* Language Support */}
      <section className="py-8 bg-gray-100 rounded-2xl">
        <div className="text-center">
          <Globe className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-4">Multi-Language Support</h3>
          <p className="text-gray-600 mb-4">
            Available in English, Sinhala (සිංහල), and Tamil (தமிழ்)
          </p>
          <div className="flex justify-center space-x-8 text-lg">
            <span className="font-semibold text-primary-600">English</span>
            <span className="font-semibold text-primary-600">සිංහල</span>
            <span className="font-semibold text-primary-600">தமிழ்</span>
          </div>
        </div>
      </section>
    </div>
  );
};