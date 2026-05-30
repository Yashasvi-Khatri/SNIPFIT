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
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
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
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
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
