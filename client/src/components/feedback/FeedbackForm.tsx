import { useState } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FeedbackFormProps {
  appointmentId: string;
  appointmentNumber: string;
  serviceName: string;
  onFeedbackSubmitted: (feedback: { rating: number; comment: string; submittedAt: string }) => void;
  onCancel?: () => void;
}

export const FeedbackForm = ({ 
  appointmentId, 
  appointmentNumber, 
  serviceName, 
  onFeedbackSubmitted, 
  onCancel 
}: FeedbackFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/appointments/${appointmentId}/feedback`, {
        rating,
        comment: comment.trim()
      });

      onFeedbackSubmitted({
        rating,
        comment: comment.trim(),
        submittedAt: new Date().toISOString()
      });
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={starValue}
          type="button"
          className={`p-1 transition-colors ${
            isActive ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
          }`}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star
            size={28}
            fill={isActive ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
          />
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    const texts = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    };
    return texts[rating as keyof typeof texts] || '';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center space-x-2">
          <MessageSquare size={20} />
          <span>Rate Your Experience</span>
        </h3>
        <p className="text-gray-600">
          How was your experience with <strong>{serviceName}</strong>?
        </p>
        <p className="text-sm text-gray-500">
          Appointment #{appointmentNumber}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-1 mb-2">
            {renderStars()}
          </div>
          {(rating > 0 || hoveredRating > 0) && (
            <p className="text-sm text-gray-600">
              {getRatingText(hoveredRating || rating)}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            placeholder="Tell us about your experience... (optional)"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              Help us improve our services with your feedback
            </p>
            <span className="text-sm text-gray-400">
              {comment.length}/1000
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
