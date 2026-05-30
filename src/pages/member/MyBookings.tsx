import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMyBookings, useCancelBooking } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LayoutDashboard,
  CreditCard,
  Dumbbell,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  Clock,
  MapPin,
  Users,
  CalendarClock,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/member/dashboard' },
  { id: 'card', label: 'My Card', icon: <CreditCard size={20} />, path: '/member/card' },
  { id: 'workouts', label: 'Workout Log', icon: <Dumbbell size={20} />, path: '/member/workouts' },
  { id: 'progress', label: 'Progress', icon: <TrendingUp size={20} />, path: '/member/progress' },
  { id: 'classes', label: 'Classes', icon: <Calendar size={20} />, path: '/member/classes' },
  { id: 'bookings', label: 'My Bookings', icon: <CalendarClock size={20} />, path: '/member/bookings' },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/member/settings' },
];

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ATTENDED: 'bg-blue-100 text-blue-700',
  NO_SHOW: 'bg-gray-100 text-gray-700',
};

export default function MyBookings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('bookings');

  const { data: bookingsData, isLoading, refetch } = useMyBookings();
  const cancelBooking = useCancelBooking();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCancelBooking = async (classId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking.mutateAsync(classId);
        refetch();
      } catch (error) {
        console.error('Cancellation failed:', error);
      }
    }
  };

  const canCancel = (startTime: string, status: string) => {
    if (status !== 'CONFIRMED') return false;
    const classStart = new Date(startTime);
    const now = new Date();
    const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilClass >= 2;
  };

  const formatClassDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isPast(date)) return format(date, 'MMM d, yyyy');
    return format(date, 'EEEE, MMM d');
  };

  const formatClassTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const upcoming = bookingsData?.upcoming || [];
  const past = bookingsData?.past || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border min-h-screen p-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">SNIPFIT</h1>
          </div>
          
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeNav === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold">My Bookings</h1>
              <p className="text-muted-foreground">Manage your class bookings</p>
            </header>

            {isLoading ? (
              <div className="space-y-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Upcoming Bookings */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarClock className="text-orange-500" size={24} />
                    <h2 className="text-xl font-semibold">Upcoming Classes ({upcoming.length})</h2>
                  </div>
                  
                  {upcoming.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <CalendarClock className="text-muted-foreground mx-auto mb-2" size={48} />
                        <p className="text-muted-foreground">No upcoming bookings</p>
                        <Button
                          className="mt-4 bg-orange-500 hover:bg-orange-600"
                          onClick={() => navigate('/member/classes')}
                        >
                          Book a Class
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {upcoming.map((booking: any) => (
                        <Card key={booking.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold">{booking.className}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                                    {booking.status}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users size={16} className="text-muted-foreground" />
                                    <span>{booking.type}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-muted-foreground" />
                                    <span>{formatClassDate(booking.startTime)}</span>
                                    <span>•</span>
                                    <span>{formatClassTime(booking.startTime)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-muted-foreground" />
                                    <span>{booking.location}</span>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mt-2">
                                  Trainer: {booking.trainerName}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                {canCancel(booking.startTime, booking.status) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelBooking(booking.classId)}
                                    disabled={cancelBooking.isPending}
                                  >
                                    <X size={16} className="mr-1" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Past Bookings */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-blue-500" size={24} />
                    <h2 className="text-xl font-semibold">Past Bookings ({past.length})</h2>
                  </div>
                  
                  {past.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No past bookings</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {past.map((booking: any) => (
                        <Card key={booking.id} className="opacity-75">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold">{booking.className}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                                    {booking.status}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users size={16} className="text-muted-foreground" />
                                    <span>{booking.type}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-muted-foreground" />
                                    <span>{formatClassDate(booking.startTime)}</span>
                                    <span>•</span>
                                    <span>{formatClassTime(booking.startTime)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-muted-foreground" />
                                    <span>{booking.location}</span>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mt-2">
                                  Trainer: {booking.trainerName}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {booking.status === 'ATTENDED' && (
                                  <CheckCircle className="text-green-500" size={20} />
                                )}
                                {booking.status === 'CANCELLED' && (
                                  <XCircle className="text-red-500" size={20} />
                                )}
                                {booking.status === 'NO_SHOW' && (
                                  <X className="text-gray-500" size={20} />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>

        {/* Bottom Tab Bar - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-2">
          <div className="flex justify-around">
            {navItems.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  navigate(item.path);
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  activeNav === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground"
            >
              <LogOut size={20} />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
