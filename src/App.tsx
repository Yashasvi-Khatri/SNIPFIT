import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AcceptAdminInvitation from './pages/AcceptAdminInvitation';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberDashboard from './pages/member/Dashboard';
import MemberCard from './pages/member/Card';
import WorkoutLog from './pages/member/WorkoutLog';
import Progress from './pages/member/Progress';
import Classes from './pages/member/Classes';
import MyBookings from './pages/member/MyBookings';
import DashboardRedirect from './components/DashboardRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import MemberManagement from './pages/admin/MemberManagement';
import MemberProfile from './pages/admin/MemberProfile';
import ClassManagement from './pages/admin/ClassManagement';

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/accept-admin-invitation" element={<AcceptAdminInvitation />} />
              <Route path="/register" element={<Register />} />
              <Route path="/schedule" element={<Schedule />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardRedirect />} />
                <Route path="/member/dashboard" element={<MemberDashboard />} />
                <Route path="/member/card" element={<MemberCard />} />
                <Route path="/member/workouts" element={<WorkoutLog />} />
                <Route path="/member/progress" element={<Progress />} />
                <Route path="/member/classes" element={<Classes />} />
                <Route path="/member/bookings" element={<MyBookings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/members" element={<MemberManagement />} />
                  <Route path="/admin/members/:id" element={<MemberProfile />} />
                  <Route path="/admin/classes" element={<ClassManagement />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
