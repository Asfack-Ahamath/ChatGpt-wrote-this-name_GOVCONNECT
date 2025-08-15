import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { MobileHeader } from './components/layout/MobileHeader';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Services } from './pages/Services';
import { BookAppointment } from './pages/BookAppointment';
import { MyAppointments } from './pages/MyAppointments';
import { AppointmentDetails } from './pages/AppointmentDetails';
import { Account } from './pages/Account';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminRegister } from './pages/admin/AdminRegister';
import { DepartmentManagement } from './pages/admin/DepartmentManagement';
import { ServiceManagement } from './pages/admin/ServiceManagement';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { SystemSettings } from './pages/admin/SystemSettings';
import { PendingApprovals } from './pages/admin/PendingApprovals';
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { AppointmentManagement } from './pages/officer/AppointmentManagement';
import { OfficerServices } from './pages/officer/OfficerServices';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

// Component to conditionally show citizen navigation
function AppContent() {
  const location = useLocation();
  
  // Don't show citizen navigation on admin or officer routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isOfficerRoute = location.pathname.startsWith('/officer');
  const showCitizenNav = !isAdminRoute && !isOfficerRoute;

  return (
    <div className={`min-h-screen ${showCitizenNav ? 'bg-white md:bg-gray-50' : 'bg-slate-50'}`}>
      {/* Desktop Header - Only for citizen routes */}
      {showCitizenNav && (
        <div className="hidden md:block">
          <Header />
        </div>
      )}
      
      {/* Mobile Header - Only for citizen routes */}
      {showCitizenNav && (
        <div className="md:hidden">
          <MobileHeader />
        </div>
      )}
      
      {/* Main Content */}
      <main className={showCitizenNav ? "md:container md:mx-auto md:px-4 md:py-8" : ""}>
        {/* Mobile app-like full screen, desktop with padding */}
        <div className={showCitizenNav ? "md:pb-0 pb-20 md:px-0 px-0" : ""}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/services" element={<Services />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/book/:serviceId" 
                  element={
                    <ProtectedRoute>
                      <BookAppointment />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/appointments" 
                  element={
                    <ProtectedRoute>
                      <MyAppointments />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/appointment/:id" 
                  element={
                    <ProtectedRoute>
                      <AppointmentDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/account" 
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  } 
                />
                {/* Admin Routes */}
                <Route 
                  path="/admin/login" 
                  element={<AdminLogin />} 
                />
                <Route 
                  path="/admin/register" 
                  element={<AdminRegister />} 
                />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <AdminRoute>
                      <UserManagement />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/departments" 
                  element={
                    <AdminRoute>
                      <DepartmentManagement />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/services" 
                  element={
                    <AdminRoute>
                      <ServiceManagement />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/analytics" 
                  element={
                    <AdminRoute>
                      <AnalyticsDashboard />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <AdminRoute>
                      <SystemSettings />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/approvals" 
                  element={
                    <AdminRoute>
                      <PendingApprovals />
                    </AdminRoute>
                  } 
                />
                
                {/* Officer Routes */}
                <Route 
                  path="/officer" 
                  element={
                    <AdminRoute requiredRole="officer">
                      <OfficerDashboard />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/officer/appointments" 
                  element={
                    <AdminRoute requiredRole="officer">
                      <AppointmentManagement />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/officer/services" 
                  element={
                    <AdminRoute requiredRole="officer">
                      <OfficerServices />
                    </AdminRoute>
                  } 
                />
              </Routes>
            </div>
          </main>
          
          {/* Mobile Bottom Navigation - Only for citizen routes */}
          {showCitizenNav && (
            <div className="md:hidden">
              <BottomNavigation />
            </div>
          )}
        </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
