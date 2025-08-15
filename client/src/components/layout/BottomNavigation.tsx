import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  FileText, 
  User
} from 'lucide-react';

export const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => {
    if (path === '/' || path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/dashboard',
      icon: Home,
      label: 'Home',
      active: isActive('/dashboard'),
      notification: false
    },
    {
      path: '/services',
      icon: FileText,
      label: 'Services',
      active: isActive('/services'),
      notification: false
    },
    {
      path: '/appointments',
      icon: Calendar,
      label: 'Appointments',
      active: isActive('/appointments'),
      notification: true
    },
    {
      path: '/account',
      icon: User,
      label: 'Account',
      active: isActive('/account'),
      notification: false
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Native iOS/Android style tab bar */}
      <div className="bg-white border-t border-gray-200 px-2 py-1 safe-area-pb">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 rounded-lg mx-1 touch-manipulation ${
                item.active
                  ? 'text-blue-600'
                  : 'text-gray-400 active:text-gray-600 active:bg-gray-50'
              }`}
            >
              <div className="relative">
                {/* Active indicator background */}
                {item.active && (
                  <div className="absolute -inset-2 bg-blue-50 rounded-lg"></div>
                )}
                
                {/* Icon container */}
                <div className="relative z-10 p-1">
                  <item.icon 
                    size={22} 
                    strokeWidth={item.active ? 2.5 : 2}
                    className={`transition-all duration-200 ${
                      item.active ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  
                  {/* Notification badge */}
                  {item.notification && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
              </div>
              
              {/* Label */}
              <span className={`text-xs font-medium transition-colors duration-200 ${
                item.active ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="bg-white h-safe-area-inset-bottom"></div>
    </div>
  );
};