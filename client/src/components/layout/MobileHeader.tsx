import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Bell, User, Menu, X, LogOut, Settings, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export const MobileHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'GOVCONNECT';
      case '/dashboard': return 'Dashboard';
      case '/services': return 'Services';
      case '/appointments': return 'My Appointments';
      case '/account': return 'Account';
      case '/login': return 'Sign In';
      case '/register': return 'Create Account';
      default:
        if (location.pathname.startsWith('/book/')) return 'Book Appointment';
        if (location.pathname.startsWith('/appointment/')) return 'Appointment Details';
        return 'GOVCONNECT';
    }
  };

  const canGoBack = () => {
    return location.pathname !== '/' && location.pathname !== '/dashboard';
  };

  const handleBack = () => {
    if (location.pathname === '/services' || location.pathname === '/appointments' || location.pathname === '/account') {
      navigate('/dashboard');
    } else {
      navigate(-1);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMenu(false);
  };

  const isMainPage = location.pathname === '/' || location.pathname === '/dashboard';

  if (!user) return null;

  return (
    <>
      {/* Native Mobile App Header */}
      <header className="md:hidden bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left Section */}
          <div className="flex items-center space-x-3 flex-1">
            {canGoBack() ? (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors touch-manipulation"
              >
                <ArrowLeft size={22} strokeWidth={2.5} />
              </button>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">GC</span>
              </div>
            )}
            
            {/* Page Title */}
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1">
            {/* Notifications - Only on main pages */}
            {isMainPage && (
              <button className="relative p-2.5 text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-full transition-colors touch-manipulation">
                <Bell size={20} strokeWidth={2} />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
              </button>
            )}

            {/* Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 text-gray-500 hover:text-gray-700 active:bg-gray-100 rounded-full transition-colors touch-manipulation"
            >
              {showMenu ? <X size={20} strokeWidth={2.5} /> : <MoreHorizontal size={20} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Native Style */}
        {showMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-20 z-40"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu Panel */}
            <div className="absolute right-4 top-16 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              {/* User Info Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-semibold text-sm">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    navigate('/account');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                >
                  <Settings size={18} className="text-gray-500" />
                  <span className="font-medium">Account Settings</span>
                </button>
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
};