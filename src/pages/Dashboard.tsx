import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useDashboardStats } from '@/hooks/useApi';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 p-4 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-red-500">
            <p>Failed to load dashboard data. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <Button onClick={logout} variant="outline">
            Sign Out
          </Button>
        </header>
        
        <div className="bg-surface p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Your Fitness Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-elevated p-4 rounded-lg">
              <h3 className="font-medium mb-2">Workouts This Week</h3>
              <p className="text-3xl font-bold">{stats?.workoutsThisWeek || 0}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.workoutChange >= 0 ? '+' : ''}{stats?.workoutChange || 0} from last week
              </p>
            </div>
            <div className="bg-surface-elevated p-4 rounded-lg">
              <h3 className="font-medium mb-2">Current Streak</h3>
              <p className="text-3xl font-bold">{stats?.currentStreak || 0} days</p>
              <p className="text-sm text-muted-foreground">Keep it up!</p>
            </div>
            <div className="bg-surface-elevated p-4 rounded-lg">
              <h3 className="font-medium mb-2">Next Session</h3>
              <p className="text-3xl font-bold">{stats?.nextSession || 'No sessions'}</p>
              <p className="text-sm text-muted-foreground">
                {stats?.nextSessionTime || 'Schedule a class'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
          <div className="bg-surface p-6 rounded-lg shadow">
            {stats?.progressData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Weight Progress</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.progressData.currentWeight} kg
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stats?.progressData.weightChange >= 0 ? '+' : ''}{stats?.progressData.weightChange} kg from start
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">BMI</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.progressData.currentBMI}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stats?.progressData.bmiChange >= 0 ? '+' : ''}{stats?.progressData.bmiChange} from start
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Recent Measurements</h4>
                  <div className="text-sm text-muted-foreground">
                    Last recorded: {stats?.progressData.lastMeasurementDate || 'No measurements yet'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Your fitness analytics will appear here once you start tracking your progress.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
