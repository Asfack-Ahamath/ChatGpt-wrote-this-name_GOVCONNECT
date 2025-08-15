import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Service {
  _id: string;
  name: string;
  description: string;
  department: {
    name: string;
    location: {
      address: string;
      city: string;
    };
    contactInfo: {
      phone: string;
    };
    workingHours: any;
  };
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
  appointmentDuration: number;
}

interface TimeSlot {
  time: string;
  endTime: string;
  display: string;
}

export const BookAppointment = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchService = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services/${serviceId}`);
      setService(response.data.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Failed to load service information');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/available-slots?serviceId=${serviceId}&date=${selectedDate}`
      );
      setAvailableSlots(response.data.data.availableSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError('Failed to load available time slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/appointments/book`, {
        serviceId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        notes: { citizen: notes }
      });

      navigate(`/appointment/${response.data.data._id}`, {
        state: { newBooking: true }
      });
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + (service?.maxAdvanceBookingDays || 30));
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h2>
        <p className="text-gray-600">The requested service could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Service Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
            <p className="text-gray-600 mb-4">{service.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin size={18} />
                <span>{service.department.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <DollarSign size={18} />
                <span>LKR {service.fees.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock size={18} />
                <span>{service.processingTime.estimatedDays} days processing</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar size={18} />
                <span>{service.appointmentDuration} minutes appointment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Address:</p>
              <p className="font-medium">{service.department.location.address}</p>
              <p className="font-medium">{service.department.location.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Contact:</p>
              <p className="font-medium">{service.department.contactInfo.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <FileText size={20} />
          <span>Required Documents</span>
        </h3>
        <div className="space-y-3">
          {service.requiredDocuments.map((doc, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
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
        <p className="text-sm text-red-600 mt-4">* Required documents</p>
      </div>

      {/* Booking Steps */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="font-medium">Select Date</span>
          </div>
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="font-medium">Select Time</span>
          </div>
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="font-medium">Confirm</span>
          </div>
        </div>

        {/* Step 1: Date Selection */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Appointment Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime('');
                setStep(1);
              }}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Step 2: Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Appointment Time
              </label>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-gray-500 py-4">No available slots for this date</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => {
                        setSelectedTime(slot.time);
                        setStep(2);
                      }}
                      className={`p-3 rounded-lg border transition-colors ${
                        selectedTime === slot.time
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      {slot.display}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Notes and Confirmation */}
          {selectedTime && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setStep(3);
                  }}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Any special requirements or additional information..."
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee:</span>
                    <span className="font-medium">LKR {service.fees.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={bookingLoading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bookingLoading ? 'Booking Appointment...' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};