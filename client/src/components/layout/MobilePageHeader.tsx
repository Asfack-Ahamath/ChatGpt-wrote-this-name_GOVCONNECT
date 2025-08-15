import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export const MobilePageHeader = ({ title, subtitle, showBack = true }: MobilePageHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack = () => {
    return showBack && location.pathname !== '/' && location.pathname !== '/dashboard';
  };

  const handleBack = () => {
    if (location.pathname.startsWith('/book/') || location.pathname.startsWith('/appointment/')) {
      navigate('/dashboard');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="md:hidden bg-gradient-to-r from-sri-green to-primary-600 text-white px-4 py-4 -mx-4 -mt-6 mb-6 sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        {canGoBack() && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-white/80 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};