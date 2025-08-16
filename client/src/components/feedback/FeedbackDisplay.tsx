import { Star, MessageSquare, Calendar } from 'lucide-react';

interface FeedbackDisplayProps {
  feedback: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
  isCompact?: boolean;
}

export const FeedbackDisplay = ({ feedback, isCompact = false }: FeedbackDisplayProps) => {
  const renderStars = (rating: number, size: number = 20) => {
    return Array.from({ length: 5 }, (_, index) => {
      const isActive = index + 1 <= rating;
      return (
        <Star
          key={index}
          size={size}
          fill={isActive ? '#FCD34D' : 'none'}
          stroke={isActive ? '#FCD34D' : '#D1D5DB'}
          strokeWidth={2}
        />
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isCompact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          {renderStars(feedback.rating, 16)}
        </div>
        <span className="text-sm font-medium text-gray-900">
          {feedback.rating}/5 - {getRatingText(feedback.rating)}
        </span>
        {feedback.comment && (
          <span className="text-sm text-gray-500 truncate max-w-xs">
            "{feedback.comment}"
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center space-x-2">
          <MessageSquare size={20} />
          <span>Your Feedback</span>
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar size={16} />
          <span>Submitted on {formatDate(feedback.submittedAt)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Rating */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Overall Rating</p>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              {renderStars(feedback.rating)}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {feedback.rating}/5
            </span>
            <span className="text-gray-600">
              ({getRatingText(feedback.rating)})
            </span>
          </div>
        </div>

        {/* Comment */}
        {feedback.comment && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Your Comments</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">
                "{feedback.comment}"
              </p>
            </div>
          </div>
        )}

        {/* Thank you message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Thank you for your feedback!</strong> Your input helps us improve our services 
            and better serve the community.
          </p>
        </div>
      </div>
    </div>
  );
};
