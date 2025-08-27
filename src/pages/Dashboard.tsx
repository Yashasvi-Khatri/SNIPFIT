import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, logout } = useAuth();

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
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">+1 from last week</p>
            </div>
            <div className="bg-surface-elevated p-4 rounded-lg">
              <h3 className="font-medium mb-2">Current Streak</h3>
              <p className="text-3xl font-bold">5 days</p>
              <p className="text-sm text-muted-foreground">Keep it up!</p>
            </div>
            <div className="bg-surface-elevated p-4 rounded-lg">
              <h3 className="font-medium mb-2">Next Session</h3>
              <p className="text-3xl font-bold">Tomorrow</p>
              <p className="text-sm text-muted-foreground">6:00 PM - 7:00 PM</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
          <div className="bg-surface p-6 rounded-lg shadow">
            <p className="text-muted-foreground">Your fitness analytics will appear here.</p>
            {/* In a real app, you would include charts/graphs here */}
          </div>
        </div>
      </div>
    </div>
  );
}
