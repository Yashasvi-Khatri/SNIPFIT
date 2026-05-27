import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberDashboard } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  CreditCard, 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Settings, 
  LogOut,
  Bell,
  Flame,
  CalendarClock,
  Trophy,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

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
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/member/settings' },
];

export default function MemberDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = useMemberDashboard();
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = (name: string | undefined): string => {
    if (!name) return 'Member';
    return name.split(' ')[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 p-4 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">
            <p>Failed to load dashboard data. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const membership = dashboardData?.membership;
  const upcomingClasses = dashboardData?.upcomingClasses || [];
  const recentWorkouts = dashboardData?.recentWorkouts || [];
  const latestMeasurement = dashboardData?.latestMeasurement;

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
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Top Greeting Bar */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {getTimeBasedGreeting()}, {getFirstName(user?.name)}!
                </h1>
                <p className="text-muted-foreground">
                  {format(new Date(), 'EEEE, d MMMM yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="text-muted-foreground" size={24} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </div>
              </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Classes This Month */}
              <div className="bg-surface p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                  <span className="text-sm text-muted-foreground">This Month</span>
                </div>
                <p className="text-3xl font-bold">{stats?.classesThisMonth || 0}</p>
                <p className="text-sm text-muted-foreground">Classes Attended</p>
              </div>

              {/* Workouts This Month */}
              <div className="bg-surface p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Dumbbell className="text-green-600" size={24} />
                  </div>
                  <span className="text-sm text-muted-foreground">This Month</span>
                </div>
                <p className="text-3xl font-bold">{stats?.workoutsThisMonth || 0}</p>
                <p className="text-sm text-muted-foreground">Workouts Logged</p>
              </div>

              {/* Total Workouts */}
              <div className="bg-surface p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="text-purple-600" size={24} />
                  </div>
                  <span className="text-sm text-muted-foreground">All Time</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalWorkouts || 0}</p>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
              </div>

              {/* Streak Days */}
              <div className="bg-surface p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Flame className="text-orange-600" size={24} />
                  </div>
                  <span className="text-sm text-muted-foreground">Current</span>
                </div>
                <p className="text-3xl font-bold">{stats?.streakDays || 0}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>

            {/* Membership Status Card */}
            {membership && (
              <div className="bg-surface p-6 rounded-lg border border-border mb-8">
                <h2 className="text-xl font-semibold mb-4">Membership Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Plan</span>
                      <span className="font-semibold">{membership.plan}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className={`font-semibold ${
                        membership.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {membership.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Days Remaining</span>
                      <span className="font-semibold">{membership.daysRemaining}</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">Membership Progress</span>
                        <span className="text-sm font-semibold">{membership.percentUsed.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${membership.percentUsed}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Started: {format(new Date(membership.startDate), 'MMM d, yyyy')}</span>
                      <span>Ends: {format(new Date(membership.endDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Classes */}
            <div className="bg-surface p-6 rounded-lg border border-border mb-8">
              <h2 className="text-xl font-semibold mb-4">Upcoming Classes</h2>
              {upcomingClasses.length > 0 ? (
                <div className="space-y-4">
                  {upcomingClasses.map((classItem) => (
                    <div key={classItem.bookingId} className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <CalendarClock className="text-primary" size={20} />
                        </div>
                        <div>
                          <p className="font-semibold">{classItem.className}</p>
                          <p className="text-sm text-muted-foreground">
                            {classItem.type} • {classItem.trainerName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {format(new Date(classItem.startTime), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(classItem.startTime), 'h:mm a')} - {format(new Date(classItem.endTime), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming classes scheduled.</p>
              )}
            </div>

            {/* Recent Workouts */}
            <div className="bg-surface p-6 rounded-lg border border-border mb-8">
              <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
              {recentWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {recentWorkouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Dumbbell className="text-green-600" size={20} />
                        </div>
                        <div>
                          <p className="font-semibold">{workout.exerciseCount} Exercises</p>
                          <p className="text-sm text-muted-foreground">
                            {workout.duration ? `${workout.duration} min` : 'No duration'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {format(new Date(workout.date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(workout.date), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent workouts logged.</p>
              )}
            </div>

            {/* Latest Measurement */}
            {latestMeasurement && (
              <div className="bg-surface p-6 rounded-lg border border-border">
                <h2 className="text-xl font-semibold mb-4">Latest Measurements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Weight</p>
                    <p className="text-2xl font-bold">
                      {latestMeasurement.weightKg ? `${latestMeasurement.weightKg} kg` : 'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Body Fat</p>
                    <p className="text-2xl font-bold">
                      {latestMeasurement.bodyFatPct ? `${latestMeasurement.bodyFatPct}%` : 'Not recorded'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Recorded on {format(new Date(latestMeasurement.date), 'MMMM d, yyyy')}
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Bottom Tab Bar - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-2">
          <div className="flex justify-around">
            {navItems.slice(0, 5).map((item) => (
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
