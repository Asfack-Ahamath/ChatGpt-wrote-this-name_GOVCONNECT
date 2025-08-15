import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  Menu,
  X,
  Calendar,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3, description: 'Overview & Statistics' },
    { name: 'Pending Approvals', href: '/admin/approvals', icon: AlertCircle, description: 'Review Appointments' },
    { name: 'User Management', href: '/admin/users', icon: Users, description: 'Manage System Users' },
    { name: 'Departments', href: '/admin/departments', icon: Building2, description: 'Government Departments' },
    { name: 'Services', href: '/admin/services', icon: FileText, description: 'Government Services' },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, description: 'Reports & Insights' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, description: 'System Configuration' },
  ];

  const officerNavigation = [
    { name: 'Dashboard', href: '/officer', icon: BarChart3, description: 'Overview & Statistics' },
    { name: 'Appointments', href: '/officer/appointments', icon: Calendar, description: 'Manage Appointments' },
    { name: 'Today\'s Schedule', href: '/officer/appointments?date=today', icon: Clock, description: 'Today\'s Bookings' },
    { name: 'Services', href: '/officer/services', icon: FileText, description: 'Department Services' },
  ];

  const navigation = user?.role === 'admin' ? adminNavigation : officerNavigation;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentPage = (href: string) => {
    try {
      // Exact match for dashboard routes
      if (href === '/admin' || href === '/officer') {
        return location.pathname === href;
      }
      // Handle query parameters for officer routes
      if (href.includes('?')) {
        const [basePath, queryString] = href.split('?');
        return location.pathname === basePath && location.search.includes(queryString.split('=')[1]);
      }
      // Use exact match for all other routes
      return location.pathname === href;
    } catch (error) {
      console.error('Error in isCurrentPage:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Professional Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out xl:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center space-x-3">
            {user?.role === 'admin' ? (
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <span className="text-lg font-bold text-white">GOVCONNECT</span>
              <p className="text-xs text-slate-300">
                {user?.role === 'admin' ? 'Administration Panel' : 'Officer Dashboard'}
              </p>
            </div>
          </div>
          <button
            className="xl:hidden text-white hover:text-slate-300 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${
              user?.role === 'admin' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'
            } rounded-xl flex items-center justify-center shadow-lg`}>
              <span className="text-sm font-bold text-white">
                {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.role === 'admin' ? 'System Administrator' : 'Government Officer'}
              </p>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                user?.role === 'admin' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                <div className={`w-1.5 h-1.5 ${
                  user?.role === 'admin' ? 'bg-indigo-500' : 'bg-blue-500'
                } rounded-full mr-1.5`} />
                Online
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isCurrentPage(item.href)
                    ? `${user?.role === 'admin' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                      }`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                                 onClick={() => setSidebarOpen(false)}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 transition-colors ${
                  isCurrentPage(item.href)
                    ? 'bg-white bg-opacity-20'
                    : `${user?.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'} group-hover:bg-opacity-80`
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className={`text-xs truncate ${
                    isCurrentPage(item.href) 
                      ? 'text-white text-opacity-80' 
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}>
                    {item.description}
                  </p>
                </div>
                {isCurrentPage(item.href) && (
                  <div className="w-2 h-2 bg-white rounded-full opacity-80" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-slate-100 group-hover:bg-red-100 rounded-lg mr-3 transition-colors">
              <LogOut className="w-5 h-5 group-hover:text-red-600" />
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="xl:pl-72">
        {/* Professional Top Bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                className="xl:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="text-slate-400">GOVCONNECT</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-600 font-medium">
                  {user?.role === 'admin' ? 'Administration' : 'Officer Panel'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span>View Citizen Portal</span>
                </Link>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-500">
                    {user?.role === 'admin' ? 'Administrator' : 'Government Officer'}
                  </p>
                </div>
                <div className={`w-10 h-10 ${
                  user?.role === 'admin' 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                    : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                } rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-sm font-bold text-white">
                    {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};