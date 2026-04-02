import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useDarkMode } from '@/hooks/useDarkMode';
import { ToastContainer, MobileNav } from '@/components/ui';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import InstallAppButton from '@/components/InstallAppButton';

// Public pages
import { Landing } from '@/pages/Landing';
import { NewLanding } from '@/pages/NewLanding';
import Home from '@/pages/HomeSimplified';
import GigWorkHome from '@/pages/GigWorkHome';
import GigWorkPlatform from '@/pages/GigWorkPlatform';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { HelpCenter } from '@/pages/HelpCenter';
import { TermsOfService } from '@/pages/TermsOfService';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { IndependentWorkerDisclaimer } from '@/pages/IndependentWorkerDisclaimer';

// Employer pages
import { EmployerDashboard } from '@/pages/employer/Dashboard';
import { EmployerJobs } from '@/pages/employer/Jobs';
import { CreateJob } from '@/pages/employer/CreateJob';
import { EmployerApplications } from '@/pages/employer/Applications';
import { EmployerProfilePage } from '@/pages/employer/Profile';
import { EmployerAnalytics } from '@/pages/employer/Analytics';
import { TimeApproval } from '@/pages/employer/TimeApproval';
import { FavoriteWorkers } from '@/pages/employer/FavoriteWorkers';
import { CreateShift } from '@/pages/employer/CreateShift';
import { ShiftManagement } from '@/pages/employer/ShiftManagement';
import { WorkerRatings } from '@/pages/employer/WorkerRatings';

// Employee pages
import { EmployeeDashboard } from '@/pages/employee/Dashboard';
import { EmployeeJobs } from '@/pages/employee/Jobs';
import { EmployeeApplications } from '@/pages/employee/Applications';
import { EmployeeProfilePage } from '@/pages/employee/Profile';
import { TimeTracking } from '@/pages/employee/TimeTracking';
import { Invoices } from '@/pages/employee/Invoices';
import { EmployerInvoices } from '@/pages/employer/Invoices';
import { Contracts } from '@/pages/employee/Contracts';
import { Reputation } from '@/pages/employee/Reputation';
import { Schedule } from '@/pages/employee/Schedule';
import { Favorites } from '@/pages/employee/Favorites';

// Shared pages
import { JobDetail } from '@/pages/JobDetail';
import { ShiftDetail } from '@/pages/ShiftDetail';
import { Messages } from '@/pages/Messages';
import { Notifications } from '@/pages/Notifications';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminShifts from '@/pages/admin/Shifts';
import AdminSupport from '@/pages/admin/Support';
import AdminVerifications from '@/pages/admin/Verifications';
import { AdminFloatingButton } from '@/components/AdminFloatingButton';
import { Chatbot } from '@/components/Chatbot';

// Verification
import { Verification } from '@/pages/employee/Verification';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'employer' | 'employee' | 'worker' | 'admin' }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Map 'employee' route requirement to 'worker' role from Supabase
  const requiredRole = role === 'employee' ? 'worker' : role;
  
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to home instead of role-specific dashboard
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Redirect admin to admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // Default: show gig work home
  return <GigWorkHome />;
}

function DarkModeWrapper({ children }: { children: React.ReactNode }) {
  useDarkMode(); // Use the hook that handles dark mode
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <DarkModeWrapper>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<NewLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/disclaimer" element={<IndependentWorkerDisclaimer />} />
          
          {/* Gig Work Platform */}
          <Route path="/gig-work" element={<GigWorkPlatform />} />
          
          {/* Home - After Login */}
          <Route path="/home" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
          
          {/* Employer routes */}
          <Route path="/employer/dashboard" element={<ProtectedRoute role="employer"><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/employer/jobs" element={<ProtectedRoute role="employer"><EmployerJobs /></ProtectedRoute>} />
          <Route path="/employer/jobs/new" element={<ProtectedRoute role="employer"><CreateJob /></ProtectedRoute>} />
          <Route path="/employer/jobs/:id" element={<ProtectedRoute role="employer"><JobDetail /></ProtectedRoute>} />
          <Route path="/employer/jobs/:id/edit" element={<ProtectedRoute role="employer"><CreateJob /></ProtectedRoute>} />
          <Route path="/employer/applications" element={<ProtectedRoute role="employer"><EmployerApplications /></ProtectedRoute>} />
          <Route path="/employer/time-approval" element={<ProtectedRoute role="employer"><TimeApproval /></ProtectedRoute>} />
          <Route path="/employer/favorites" element={<ProtectedRoute role="employer"><FavoriteWorkers /></ProtectedRoute>} />
          <Route path="/employer/shifts" element={<ProtectedRoute role="employer"><ShiftManagement /></ProtectedRoute>} />
          <Route path="/employer/shifts/new" element={<ProtectedRoute role="employer"><CreateShift /></ProtectedRoute>} />
          <Route path="/employer/shifts/:id" element={<ProtectedRoute role="employer"><ShiftDetail /></ProtectedRoute>} />
          <Route path="/employer/ratings" element={<ProtectedRoute role="employer"><WorkerRatings /></ProtectedRoute>} />
          <Route path="/employer/profile" element={<ProtectedRoute role="employer"><EmployerProfilePage /></ProtectedRoute>} />
          <Route path="/employer/analytics" element={<ProtectedRoute role="employer"><EmployerAnalytics /></ProtectedRoute>} />
          <Route path="/employer/invoices" element={<ProtectedRoute role="employer"><EmployerInvoices /></ProtectedRoute>} />
          
          {/* Employee routes */}
          <Route path="/employee/dashboard" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/jobs" element={<ProtectedRoute role="employee"><EmployeeJobs /></ProtectedRoute>} />
          <Route path="/employee/jobs/:id" element={<ProtectedRoute role="employee"><JobDetail /></ProtectedRoute>} />
          <Route path="/employee/shifts/:id" element={<ProtectedRoute role="employee"><ShiftDetail /></ProtectedRoute>} />
          <Route path="/employee/applications" element={<ProtectedRoute role="employee"><EmployeeApplications /></ProtectedRoute>} />
          <Route path="/employee/contracts" element={<ProtectedRoute role="employee"><Contracts /></ProtectedRoute>} />
          <Route path="/employee/time-tracking" element={<ProtectedRoute role="employee"><TimeTracking /></ProtectedRoute>} />
          <Route path="/employee/invoices" element={<ProtectedRoute role="employee"><Invoices /></ProtectedRoute>} />
          <Route path="/employee/reputation" element={<ProtectedRoute role="employee"><Reputation /></ProtectedRoute>} />
          <Route path="/employee/schedule" element={<ProtectedRoute role="employee"><Schedule /></ProtectedRoute>} />
          <Route path="/employee/favorites" element={<ProtectedRoute role="employee"><Favorites /></ProtectedRoute>} />
          <Route path="/employee/verification" element={<ProtectedRoute role="employee"><Verification /></ProtectedRoute>} />
          <Route path="/employee/profile" element={<ProtectedRoute role="employee"><EmployeeProfilePage /></ProtectedRoute>} />
          
          {/* Shared authenticated routes */}
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/shifts" element={<ProtectedRoute role="admin"><AdminShifts /></ProtectedRoute>} />
          <Route path="/admin/verifications" element={<ProtectedRoute role="admin"><AdminVerifications /></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute role="admin"><AdminSupport /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AdminFloatingButton />
        <FloatingActionButton />
        <Chatbot />
        <InstallAppButton />
        <MobileNav />
        <ToastContainer />
      </DarkModeWrapper>
    </BrowserRouter>
  );
}
