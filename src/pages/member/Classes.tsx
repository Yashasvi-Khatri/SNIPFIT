import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGymClasses, useBookClass, useCancelBooking } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LayoutDashboard,
  CreditCard,
  Dumbbell,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  Filter,
  MapPin,
  Clock,
  Users,
  CalendarClock
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

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

const CLASS_TYPES = ['YOGA', 'STRENGTH', 'CARDIO', 'MMA', 'HIIT', 'ZUMBA', 'BARRE', 'PERSONAL_TRAINING', 'NUTRITION'] as const;

type ClassType = typeof CLASS_TYPES[number];

const CLASS_TYPE_COLORS: Record<ClassType, string> = {
  YOGA: 'bg-purple-100 text-purple-700',
  STRENGTH: 'bg-red-100 text-red-700',
  CARDIO: 'bg-blue-100 text-blue-700',
  MMA: 'bg-orange-100 text-orange-700',
  HIIT: 'bg-yellow-100 text-yellow-700',
  ZUMBA: 'bg-pink-100 text-pink-700',
  BARRE: 'bg-indigo-100 text-indigo-700',
  PERSONAL_TRAINING: 'bg-green-100 text-green-700',
  NUTRITION: 'bg-teal-100 text-teal-700',
};

export default function Classes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('classes');
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
  });

  const { data: classesData, isLoading, refetch } = useGymClasses(filters);
  const bookClass = useBookClass();
  const cancelBooking = useCancelBooking();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBookClass = async (classId: string) => {
    try {
      await bookClass.mutateAsync(classId);
      refetch();
    } catch (error) {
      console.error('Booking failed:', error);
    }
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

  const formatClassDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  const formatClassTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const canCancel = (startTime: string) => {
    const classStart = new Date(startTime);
    const now = new Date();
    const hoursUntilClass = (classStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilClass >= 2;
  };

  const classes = classesData?.classes || [];

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
              <h1 className="text-3xl font-bold">Class Schedule</h1>
              <p className="text-muted-foreground">Book and manage your gym classes</p>
            </header>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter size={20} />
                  Filter Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Class Type</Label>
                    <select
                      id="type"
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">All Types</option>
                      {CLASS_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Classes Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12">
                <CalendarClock className="text-muted-foreground mx-auto mb-4" size={48} />
                <h3 className="text-lg font-semibold mb-2">No classes available</h3>
                <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((gymClass: any) => (
                  <Card key={gymClass.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${CLASS_TYPE_COLORS[gymClass.type as ClassType]}`}>
                          {gymClass.type}
                        </span>
                        {gymClass.spotsAvailable <= 3 && (
                          <span className="text-xs text-orange-600 font-medium">
                            {gymClass.spotsAvailable} spots left
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg">{gymClass.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users size={16} className="text-muted-foreground" />
                          <span className="font-medium">{gymClass.trainer.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={16} className="text-muted-foreground" />
                          <span>{formatClassDate(gymClass.startTime)}</span>
                          <span>•</span>
                          <span>{formatClassTime(gymClass.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={16} className="text-muted-foreground" />
                          <span>{gymClass.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users size={16} className="text-muted-foreground" />
                          <span>{gymClass.spotsAvailable} / {gymClass.capacity} spots available</span>
                        </div>
                      </div>

                      {gymClass.isBooked ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleCancelBooking(gymClass.id)}
                          disabled={!canCancel(gymClass.startTime) || cancelBooking.isPending}
                        >
                          {cancelBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={() => handleBookClass(gymClass.id)}
                          disabled={gymClass.spotsAvailable === 0 || bookClass.isPending}
                        >
                          {bookClass.isPending ? 'Booking...' : 
                           gymClass.spotsAvailable === 0 ? 'Full' : 'Book Class'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
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
