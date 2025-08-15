import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  Users, 
  Calendar, 
  Building2, 
  FileText, 
  TrendingUp,
  Settings,
  Shield,
  UserCog,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AdminStats {
  totalUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalDepartments: number;
  totalServices: number;
  admins: number;
  officers: number;
  citizens: number;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalDepartments: 0,
    totalServices: 0,
    admins: 0,
    officers: 0,
    citizens: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Pending Approvals',
      description: 'Review and approve appointment requests',
      icon: AlertCircle,
      link: '/admin/approvals',
      color: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      title: 'User Management',
      description: 'Manage admins, officers, and citizens',
      icon: Users,
      link: '/admin/users',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      title: 'Department Management',
      description: 'Manage government departments',
      icon: Building2,
      link: '/admin/departments',
      color: 'bg-gradient-to-br from-emerald-500 to-green-600'
    },
    {
      title: 'Service Management',
      description: 'Manage government services',
      icon: FileText,
      link: '/admin/services',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600'
    },
    {
      title: 'Appointment Analytics',
      description: 'View appointment reports and analytics',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'bg-gradient-to-br from-rose-500 to-red-500'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      link: '/admin/settings',
      color: 'bg-gradient-to-br from-slate-500 to-slate-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Professional Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
        <div className="absolute top-0 right-0 -mt-4 -mr-16 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-indigo-400/10 rounded-full" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Administration Dashboard
                  </h1>
                  <p className="text-slate-300 mt-1">
                    Welcome back, {user?.firstName}! Here's your system overview.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>System Online</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <Clock size={14} />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-xl font-bold text-white">
                      {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user?.firstName} {user?.lastName}</p>
                    <p className="text-slate-300">System Administrator</p>
                    <div className="flex items-center mt-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                      <span className="text-green-300">Active Session</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Professional Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-3 text-xs text-emerald-600">
                  <TrendingUp size={12} className="mr-1" />
                  <span>+12% this month</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Admins: {stats.admins}</span>
                <span>Officers: {stats.officers}</span>
                <span>Citizens: {stats.citizens}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Appointments</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalAppointments.toLocaleString()}</p>
                <div className="flex items-center mt-3 text-xs text-emerald-600">
                  <TrendingUp size={12} className="mr-1" />
                  <span>+8% this week</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center text-xs text-amber-600">
                <Clock size={12} className="mr-1" />
                <span>Pending: {stats.pendingAppointments}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Departments</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalDepartments}</p>
                <div className="flex items-center mt-3 text-xs text-emerald-600">
                  <TrendingUp size={12} className="mr-1" />
                  <span>All Active</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center text-xs text-slate-500">
                <span>Government Offices</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Services</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalServices}</p>
                <div className="flex items-center mt-3 text-xs text-emerald-600">
                  <TrendingUp size={12} className="mr-1" />
                  <span>Available Online</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center text-xs text-slate-500">
                <span>Across All Departments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Quick Actions */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
              <p className="text-slate-600 mt-1">Manage your system efficiently</p>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>All systems operational</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 hover:shadow-2xl hover:border-slate-300/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{action.description}</p>
                    <div className="flex items-center mt-3 text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <span>Click to manage</span>
                      <div className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Professional Recent Activity */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Recent System Activity</h3>
              <p className="text-slate-600 text-sm mt-1">Live updates from your system</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">Live</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl border border-blue-100/50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">New user registration</p>
                <p className="text-xs text-slate-600 mt-1">John Doe joined as a citizen</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">2 min ago</span>
            </div>
            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-xl border border-emerald-100/50">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">Appointment completed</p>
                <p className="text-xs text-slate-600 mt-1">DMT License Renewal processed successfully</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">15 min ago</span>
            </div>
            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 rounded-xl border border-amber-100/50">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">New service added</p>
                <p className="text-xs text-slate-600 mt-1">Marriage Certificate service is now available</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">1 hour ago</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link 
              to="/admin/analytics" 
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View all activity
              <div className="ml-2">→</div>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};