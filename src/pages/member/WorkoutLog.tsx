import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useWorkouts, 
  useWorkoutStats, 
  useCreateWorkout, 
  useUpdateWorkout, 
  useDeleteWorkout 
} from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  CreditCard, 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Activity,
  CalendarClock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import WorkoutFormModal from '@/components/workouts/WorkoutFormModal';
import WorkoutDetailModal from '@/components/workouts/WorkoutDetailModal';

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

interface Workout {
  id: string;
  date: string;
  notes?: string | null;
  duration?: number | null;
  exerciseCount: number;
  createdAt: string;
}

export default function WorkoutLog() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: workoutsData, isLoading } = useWorkouts();
  const { data: stats } = useWorkoutStats();
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();

  const [activeNav, setActiveNav] = useState('workouts');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateWorkout = async (data: any) => {
    await createWorkout.mutateAsync(data);
  };

  const handleUpdateWorkout = async (data: any) => {
    await updateWorkout.mutateAsync({ id: selectedWorkout.id, data });
  };

  const handleDeleteWorkout = async (id: string) => {
    await deleteWorkout.mutateAsync(id);
  };

  const openDetailModal = (workout: any) => {
    setSelectedWorkout(workout);
    setEditMode(false);
    setIsDetailModalOpen(true);
  };

  const openEditModal = (workout: any) => {
    setSelectedWorkout(workout);
    setEditMode(true);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d');
    }
  };

  const workouts = workoutsData?.workouts || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 p-4 rounded-lg h-24"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 p-4 rounded-lg h-20"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-3xl font-bold">Workout Log</h1>
              <Button
                onClick={() => {
                  setSelectedWorkout(null);
                  setEditMode(false);
                  setIsFormModalOpen(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 gap-2"
              >
                <Plus size={20} />
                Log New Workout
              </Button>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-surface p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="text-blue-500" size={24} />
                  <span className="text-sm text-muted-foreground">All Time</span>
                </div>
                <p className="text-3xl font-bold">{stats?.totalWorkouts || 0}</p>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
              </div>

              <div className="bg-surface p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="text-green-500" size={24} />
                  <span className="text-sm text-muted-foreground">This Month</span>
                </div>
                <p className="text-3xl font-bold">{stats?.thisMonth || 0}</p>
                <p className="text-sm text-muted-foreground">Workouts</p>
              </div>

              <div className="bg-surface p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Dumbbell className="text-purple-500" size={24} />
                  <span className="text-sm text-muted-foreground">This Week</span>
                </div>
                <p className="text-3xl font-bold">{stats?.thisWeek || 0}</p>
                <p className="text-sm text-muted-foreground">Workouts</p>
              </div>

              <div className="bg-surface p-6 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="text-orange-500" size={24} />
                  <span className="text-sm text-muted-foreground">Favorite</span>
                </div>
                <p className="text-lg font-bold truncate">
                  {stats?.mostCommonExercises?.[0]?.name || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats?.mostCommonExercises?.[0]?.count || 0} times
                </p>
              </div>
            </div>

            {/* Workout List */}
            <div className="space-y-4">
              {workouts.length === 0 ? (
                <div className="text-center py-12">
                  <Dumbbell className="text-muted-foreground mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-semibold mb-2">No workouts logged yet</h3>
                  <p className="text-muted-foreground mb-4">Start tracking your fitness journey today!</p>
                  <Button
                    onClick={() => {
                      setSelectedWorkout(null);
                      setEditMode(false);
                      setIsFormModalOpen(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 gap-2"
                  >
                    <Plus size={20} />
                    Log Your First Workout
                  </Button>
                </div>
              ) : (
                workouts.map((workout: Workout) => (
                  <div
                    key={workout.id}
                    className="bg-surface p-4 rounded-lg border border-border cursor-pointer hover:border-primary transition-colors"
                    onClick={() => openDetailModal(workout)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{formatDate(workout.date)}</h3>
                          <span className="text-sm text-muted-foreground">
                            {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? 's' : ''}
                          </span>
                          {workout.duration && (
                            <span className="text-sm text-muted-foreground">
                              • {workout.duration} min
                            </span>
                          )}
                        </div>
                        {workout.notes && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {workout.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(workout);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWorkout(workout.id);
                          }}
                          disabled={deleteWorkout.isPending}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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

      {/* Form Modal */}
      <WorkoutFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={editMode ? handleUpdateWorkout : handleCreateWorkout}
        editData={editMode ? selectedWorkout : undefined}
        isLoading={createWorkout.isPending || updateWorkout.isPending}
      />

      {/* Detail Modal */}
      {selectedWorkout && (
        <WorkoutDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          workout={selectedWorkout}
          onEdit={openEditModal}
          onDelete={handleDeleteWorkout}
          isDeleting={deleteWorkout.isPending}
        />
      )}
    </div>
  );
}
