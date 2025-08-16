import { useState, useEffect } from 'react';
import { Star, TrendingUp, MessageSquare, BarChart3, Users } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FeedbackStats {
  overall: {
    totalFeedbacks: number;
    averageRating: number;
    ratingDistribution: {
      rating1: number;
      rating2: number;
      rating3: number;
      rating4: number;
      rating5: number;
    };
  };
  byService: Array<{
    _id: string;
    serviceName: string;
    totalFeedbacks: number;
    averageRating: number;
  }>;
}

interface RecentFeedback {
  _id: string;
  appointmentNumber: string;
  appointmentDate: string;
  feedback: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
  citizen: {
    firstName: string;
    lastName: string;
  };
  service: {
    name: string;
  };
  department: {
    name: string;
  };
  officer?: {
    firstName: string;
    lastName: string;
  };
}

export const FeedbackAnalytics = () => {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<RecentFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const [statsResponse, recentResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/appointments/feedback/stats`),
        axios.get(`${API_BASE_URL}/appointments/feedback/recent?limit=5`)
      ]);

      setStats(statsResponse.data.data);
      setRecentFeedback(recentResponse.data.data);
    } catch (error: any) {
      setError('Failed to load feedback analytics');
      console.error('Error fetching feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, index) => {
      const isActive = index + 1 <= rating;
      return (
        <Star
          key={index}
          size={size}
          fill={isActive ? '#FCD34D' : 'none'}
          stroke={isActive ? '#FCD34D' : '#D1D5DB'}
          strokeWidth={1.5}
        />
      );
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.overall.totalFeedbacks === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
          <p className="text-gray-600">Feedback will appear here once citizens start rating completed appointments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Feedback */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-3xl font-bold text-gray-900">{stats.overall.totalFeedbacks}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="flex items-center space-x-2">
                <p className={`text-3xl font-bold ${getRatingColor(stats.overall.averageRating)}`}>
                  {stats.overall.averageRating}
                </p>
                <div className="flex items-center space-x-1">
                  {renderStars(Math.round(stats.overall.averageRating))}
                </div>
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Satisfaction Rate */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(((stats.overall.ratingDistribution.rating4 + stats.overall.ratingDistribution.rating5) / stats.overall.totalFeedbacks) * 100)}%
              </p>
              <p className="text-sm text-gray-500">4+ star ratings</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <BarChart3 size={20} />
          <span>Rating Distribution</span>
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.overall.ratingDistribution[`rating${rating}` as keyof typeof stats.overall.ratingDistribution];
            const percentage = stats.overall.totalFeedbacks > 0 ? (count / stats.overall.totalFeedbacks) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star size={14} fill="#FCD34D" stroke="#FCD34D" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center space-x-2 w-20">
                  <span className="text-sm font-medium">{count}</span>
                  <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Performance */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Performance</h3>
          <div className="space-y-4">
            {stats.byService.slice(0, 5).map((service) => (
              <div key={service._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{service.serviceName}</p>
                  <p className="text-sm text-gray-500">{service.totalFeedbacks} reviews</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(Math.round(service.averageRating))}
                  </div>
                  <span className={`font-medium ${getRatingColor(service.averageRating)}`}>
                    {service.averageRating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Feedback</h3>
          <div className="space-y-4">
            {recentFeedback.map((feedback) => (
              <div key={feedback._id} className="border-l-4 border-primary-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(feedback.feedback.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {feedback.citizen.firstName} {feedback.citizen.lastName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(feedback.feedback.submittedAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{feedback.service.name}</p>
                {feedback.feedback.comment && (
                  <p className="text-sm text-gray-800 italic">"{feedback.feedback.comment}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
