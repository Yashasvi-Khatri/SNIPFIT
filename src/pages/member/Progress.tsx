import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMeasurements, useCreateMeasurement, useDeleteMeasurement } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Plus,
  Trash2,
  Scale,
  Ruler,
  Camera,
  CalendarClock
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const measurementSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  weightKg: z.number().min(20).max(300).optional(),
  bodyFatPct: z.number().min(1).max(70).optional(),
  chestCm: z.number().min(30).max(200).optional(),
  waistCm: z.number().min(30).max(200).optional(),
  hipsCm: z.number().min(30).max(200).optional(),
  bicepCm: z.number().min(10).max(100).optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    return data.weightKg !== undefined || data.bodyFatPct !== undefined ||
           data.chestCm !== undefined || data.waistCm !== undefined ||
           data.hipsCm !== undefined || data.bicepCm !== undefined;
  },
  { message: 'At least one measurement field is required' }
);

type MeasurementFormData = z.infer<typeof measurementSchema>;

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

export default function Progress() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: measurementsData, isLoading } = useMeasurements();
  const createMeasurement = useCreateMeasurement();
  const deleteMeasurement = useDeleteMeasurement();

  const [activeNav, setActiveNav] = useState('progress');
  const [showForm, setShowForm] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState({
    chest: true,
    waist: true,
    hips: true,
    bicep: true,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateMeasurement = async (data: MeasurementFormData) => {
    await createMeasurement.mutateAsync(data);
    reset({
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowForm(false);
  };

  const handleDeleteMeasurement = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      await deleteMeasurement.mutateAsync(id);
    }
  };

  const measurements = measurementsData?.measurements || [];
  const latestMeasurement = measurementsData?.latestMeasurement;
  const weightChange = measurementsData?.weightChange;
  const bodyFatChange = measurementsData?.bodyFatChange;

  // Prepare chart data
  const weightData = measurements
    .filter((m: any) => m.weightKg !== null)
    .map((m: any) => ({
      date: format(new Date(m.date), 'MMM d'),
      weight: m.weightKg,
    }));

  const measurementsDataChart = measurements.map((m: any) => ({
    date: format(new Date(m.date), 'MMM d'),
    chest: m.chestCm || null,
    waist: m.waistCm || null,
    hips: m.hipsCm || null,
    bicep: m.bicepCm || null,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-96 bg-gray-100 rounded-lg"></div>
              <div className="h-96 bg-gray-100 rounded-lg"></div>
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
            <header className="mb-8">
              <h1 className="text-3xl font-bold">Progress Tracker</h1>
              <p className="text-muted-foreground">Track your body measurements and visualize your progress</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Charts */}
              <div className="space-y-6">
                {/* Progress Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Current Weight</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Scale className="text-orange-500" size={20} />
                        <p className="text-2xl font-bold">
                          {latestMeasurement?.weightKg ? `${latestMeasurement.weightKg} kg` : 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Weight Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold ${
                        weightChange !== null && weightChange < 0 ? 'text-green-600' : 
                        weightChange !== null && weightChange > 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {weightChange !== null ? (
                          `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`
                        ) : 'N/A'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Body Fat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Ruler className="text-blue-500" size={20} />
                        <p className="text-2xl font-bold">
                          {latestMeasurement?.bodyFatPct ? `${latestMeasurement.bodyFatPct}%` : 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Measurements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{measurements.length}</p>
                      <p className="text-sm text-muted-foreground">Total logged</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Weight Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weight Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {weightData.length >= 2 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={weightData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="weight" stroke="#FF6B2C" strokeWidth={2} dot={{ fill: '#FF6B2C' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Scale className="mx-auto mb-2" size={48} />
                        <p>Log at least 2 weight measurements to see your trend</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Body Measurements Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Body Measurements Over Time</CardTitle>
                    <div className="flex gap-4 mt-2">
                      {Object.entries(visibleMetrics).map(([key, visible]) => (
                        <label key={key} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={visible}
                            onChange={() => setVisibleMetrics(prev => ({ ...prev, [key as keyof typeof prev]: !prev[key as keyof typeof prev] }))}
                            className="rounded"
                          />
                          <span className="capitalize">{key}</span>
                        </label>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {measurements.length >= 2 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={measurementsDataChart}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          {visibleMetrics.chest && <Line type="monotone" dataKey="chest" stroke="#8884d8" name="Chest" />}
                          {visibleMetrics.waist && <Line type="monotone" dataKey="waist" stroke="#82ca9d" name="Waist" />}
                          {visibleMetrics.hips && <Line type="monotone" dataKey="hips" stroke="#ffc658" name="Hips" />}
                          {visibleMetrics.bicep && <Line type="monotone" dataKey="bicep" stroke="#ff7300" name="Bicep" />}
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Ruler className="mx-auto mb-2" size={48} />
                        <p>Log at least 2 measurements to see trends</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Form + History */}
              <div className="space-y-6">
                {/* Measurement Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Log Today's Measurement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showForm ? (
                      <Button
                        onClick={() => setShowForm(true)}
                        className="w-full bg-orange-500 hover:bg-orange-600 gap-2"
                      >
                        <Plus size={20} />
                        Add Measurement
                      </Button>
                    ) : (
                      <form onSubmit={handleSubmit(handleCreateMeasurement)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            {...register('date')}
                            className={errors.date ? 'border-red-500' : ''}
                          />
                          {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="weightKg">Weight (kg)</Label>
                            <Input
                              id="weightKg"
                              type="number"
                              step="0.1"
                              placeholder="70.5"
                              {...register('weightKg', { valueAsNumber: true })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bodyFatPct">Body Fat %</Label>
                            <Input
                              id="bodyFatPct"
                              type="number"
                              step="0.1"
                              placeholder="15.5"
                              {...register('bodyFatPct', { valueAsNumber: true })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="chestCm">Chest (cm)</Label>
                            <Input
                              id="chestCm"
                              type="number"
                              step="0.5"
                              placeholder="100"
                              {...register('chestCm', { valueAsNumber: true })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="waistCm">Waist (cm)</Label>
                            <Input
                              id="waistCm"
                              type="number"
                              step="0.5"
                              placeholder="80"
                              {...register('waistCm', { valueAsNumber: true })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="hipsCm">Hips (cm)</Label>
                            <Input
                              id="hipsCm"
                              type="number"
                              step="0.5"
                              placeholder="95"
                              {...register('hipsCm', { valueAsNumber: true })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bicepCm">Bicep (cm)</Label>
                            <Input
                              id="bicepCm"
                              type="number"
                              step="0.5"
                              placeholder="35"
                              {...register('bicepCm', { valueAsNumber: true })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any additional notes..."
                            {...register('notes')}
                            rows={2}
                          />
                        </div>

                        {errors.root && (
                          <p className="text-sm text-red-500">{errors.root.message}</p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={createMeasurement.isPending}
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                          >
                            {createMeasurement.isPending ? 'Saving...' : 'Save Measurement'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowForm(false);
                              reset();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {/* Measurement History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Measurement History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {measurements.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No measurements logged yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Date</th>
                              <th className="text-left p-2">Weight</th>
                              <th className="text-left p-2">Body Fat</th>
                              <th className="text-left p-2">Chest</th>
                              <th className="text-left p-2">Waist</th>
                              <th className="text-left p-2">Hips</th>
                              <th className="text-left p-2">Bicep</th>
                              <th className="text-left p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {measurements.map((m: any) => (
                              <tr
                                key={m.id}
                                className={`border-b ${m.id === latestMeasurement?.id ? 'border-l-4 border-l-orange-500' : ''}`}
                              >
                                <td className="p-2">{format(new Date(m.date), 'MMM d, yyyy')}</td>
                                <td className="p-2">{m.weightKg || '–'}</td>
                                <td className="p-2">{m.bodyFatPct ? `${m.bodyFatPct}%` : '–'}</td>
                                <td className="p-2">{m.chestCm || '–'}</td>
                                <td className="p-2">{m.waistCm || '–'}</td>
                                <td className="p-2">{m.hipsCm || '–'}</td>
                                <td className="p-2">{m.bicepCm || '–'}</td>
                                <td className="p-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMeasurement(m.id)}
                                    disabled={deleteMeasurement.isPending}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Progress Photos Placeholder */}
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera size={20} />
                      Progress Photos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Camera className="mx-auto mb-2" size={48} />
                      <p className="font-semibold">Coming Soon</p>
                      <p className="text-sm">Progress photos feature launching soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
    </div>
  );
}
