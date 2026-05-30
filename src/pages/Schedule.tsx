import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Loader2, Dumbbell, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { useGymClasses, useBookClass, useCancelBooking } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';

const CLASS_TYPES = ['All Types', 'YOGA', 'STRENGTH', 'CARDIO', 'MMA', 'HIIT', 'ZUMBA', 'BARRE'];

export interface GymClassItem {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  capacity: number;
  spotsAvailable: number;
  location: string;
  description?: string | null;
  trainer: { id: string; name: string };
  isBooked: boolean;
}

export interface ScheduleProps {
  className?: string;
}

export default function Schedule({ className = '' }: ScheduleProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedTrainer, setSelectedTrainer] = useState('All Trainers');

  // Calculate week range
  const getWeekRange = () => {
    const today = new Date();
    const monday = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
    const sunday = endOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
    return { start: monday, end: sunday };
  };

  const weekRange = getWeekRange();
  const startDate = format(weekRange.start, 'yyyy-MM-dd');
  const endDate = format(weekRange.end, 'yyyy-MM-dd');

  const { data: classesData, isLoading, error, refetch } = useGymClasses({
    startDate,
    endDate,
    ...(selectedType !== 'All Types' ? { type: selectedType } : {}),
  });

  const bookClass = useBookClass();
  const cancelBooking = useCancelBooking();

  const classes: GymClassItem[] = classesData?.classes || [];

  // Get unique trainers from classes
  const trainers = [...new Set(classes.map(c => c.trainer?.name).filter(Boolean))];

  // Filter by trainer
  const filteredClasses = selectedTrainer === 'All Trainers'
    ? classes
    : classes.filter(c => c.trainer?.name === selectedTrainer);

  // Group classes by day
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const getDayDate = (dayIndex: number) => addDays(weekRange.start, dayIndex);

  const getClassesForDay = (dayIndex: number) => {
    const dayDate = getDayDate(dayIndex);
    return filteredClasses.filter((c) => {
      const classDate = new Date(c.startTime);
      return classDate.toDateString() === dayDate.toDateString();
    });
  };

  const handlePrevWeek = () => setWeekOffset(weekOffset - 1);
  const handleNextWeek = () => setWeekOffset(weekOffset + 1);
  const handleThisWeek = () => setWeekOffset(0);

  const handleBook = async (classId: string) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/schedule');
      return;
    }
    await bookClass.mutateAsync(classId);
    refetch();
  };

  const handleCancel = async (classId: string) => {
    if (window.confirm('Cancel this booking?')) {
      await cancelBooking.mutateAsync(classId);
      refetch();
    }
  };

  const getSpotsColor = (spots: number) => {
    if (spots >= 5) return 'text-green-500';
    if (spots >= 2) return 'text-amber-500';
    return 'text-red-500';
  };

  const getSpotsBorder = (spots: number) => {
    if (spots === 0) return 'border-red-500/30';
    if (spots <= 3) return 'border-amber-500/30';
    return 'border-green-500/30';
  };

  return (
    <div className={`min-h-screen bg-[#0A0A0A] ${className}`}>
      <Helmet>
        <title>Class Schedule | SNIPFIT Gym Rohini | Book Yoga, MMA, Cardio Classes</title>
        <meta name="description" content="View and book upcoming gym classes at SNIPFIT Rohini." />
      </Helmet>

      <header className="border-b border-dark-border bg-dark-bg/95 backdrop-blur-md">
        <div className="container-max flex items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">
              <span className="text-white">SNIP</span>
              <span className="text-primary">FIT</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/member/dashboard" className="btn-ghost text-sm">Dashboard</Link>
            ) : (
              <Link to="/login" className="btn-ghost text-sm">Member Login</Link>
            )}
            <Link to="/" className="text-gray-400 hover:text-white text-sm">← Back to Home</Link>
          </div>
        </div>
      </header>

      <main className="section-padding">
        <div className="container-max">
          <div className="mb-8 text-center">
            <p className="section-tag">CLASS TIMETABLE</p>
            <h1 className="text-4xl font-bold text-white">
              UPCOMING <span className="gradient-text">CLASSES</span>
            </h1>
            <p className="mt-4 text-gray-450">
              Book your spot in our group classes and training sessions
            </p>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6 bg-[#141414] border border-[#2A2A2A] rounded-lg p-4">
            <Button variant="ghost" onClick={handlePrevWeek}>
              <ChevronLeft size={20} />
            </Button>
            <div className="text-center">
              <p className="text-white font-semibold">
                {format(weekRange.start, 'MMM d')} - {format(weekRange.end, 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {weekOffset !== 0 && (
                <Button variant="outline" size="sm" onClick={handleThisWeek}>
                  This Week
                </Button>
              )}
              <Button variant="ghost" onClick={handleNextWeek}>
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {CLASS_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'bg-primary text-white'
                      : 'bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:border-primary/50'
                  }`}
                >
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            {trainers.length > 0 && (
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className="bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="All Trainers">All Trainers</option>
                {trainers.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="card mx-auto max-w-lg p-8 text-center">
              <p className="text-red-400">Unable to load class schedule. Please try again later.</p>
            </div>
          )}

          {!isLoading && filteredClasses.length === 0 && (
            <div className="card mx-auto max-w-lg p-8 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-550" />
              <p className="text-gray-450">No classes found. Try a different week or filter.</p>
            </div>
          )}

          {!isLoading && filteredClasses.length > 0 && (
            <>
              {/* Desktop Week View */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-7 gap-3">
                  {days.map((day, idx) => {
                    const dayClasses = getClassesForDay(idx);
                    const dayDate = getDayDate(idx);
                    const isToday = dayDate.toDateString() === new Date().toDateString();

                    return (
                      <div key={day} className={`min-h-[400px] bg-[#141414] border ${isToday ? 'border-primary/50' : 'border-[#2A2A2A]'} rounded-lg p-3`}>
                        <div className={`text-center pb-3 mb-3 border-b border-[#2A2A2A] ${isToday ? 'bg-primary/5 rounded-lg p-2' : ''}`}>
                          <p className="text-sm font-semibold text-white">{day}</p>
                          <p className="text-xs text-gray-400">{format(dayDate, 'MMM d')}</p>
                        </div>
                        <div className="space-y-2">
                          {dayClasses.length > 0 ? dayClasses.map((cls) => (
                            <div
                              key={cls.id}
                              className={`bg-[#1A1A1A] border ${getSpotsBorder(cls.spotsAvailable)} rounded-lg p-3 text-sm ${cls.isBooked ? 'ring-1 ring-primary/30' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs text-primary font-semibold truncate">
                                  {format(new Date(cls.startTime), 'h:mm a')}
                                </span>
                                <span className={`text-xs font-medium ${getSpotsColor(cls.spotsAvailable)}`}>
                                  {cls.spotsAvailable === 0 ? 'Full' : `${cls.spotsAvailable} left`}
                                </span>
                              </div>
                              <p className="text-white font-medium text-xs truncate">{cls.name}</p>
                              <p className="text-gray-500 text-xs truncate">{cls.trainer?.name}</p>
                              {cls.isBooked ? (
                                <button
                                  onClick={() => handleCancel(cls.id)}
                                  className="mt-2 w-full text-xs bg-green-500/20 text-green-500 rounded py-1 hover:bg-green-500/30 transition-colors"
                                >
                                  Booked ✓
                                </button>
                              ) : cls.spotsAvailable > 0 ? (
                                <button
                                  onClick={() => handleBook(cls.id)}
                                  className="mt-2 w-full text-xs bg-primary/20 text-primary rounded py-1 hover:bg-primary/30 transition-colors"
                                >
                                  Book
                                </button>
                              ) : (
                                <div className="mt-2 w-full text-xs bg-gray-500/20 text-gray-500 rounded py-1 text-center">
                                  Full
                                </div>
                              )}
                            </div>
                          )) : (
                            <p className="text-gray-600 text-xs text-center py-4">No classes</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Day Selector */}
              <div className="lg:hidden">
                <DaySelector
                  days={days}
                  weekStart={weekRange.start}
                  getClassesForDay={getClassesForDay}
                  isAuthenticated={isAuthenticated}
                  onBook={handleBook}
                  onCancel={handleCancel}
                  isBooking={bookClass.isPending}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Mobile Day Selector Component
function DaySelector({
  days, weekStart, getClassesForDay, isAuthenticated, onBook, onCancel, isBooking
}: {
  days: string[];
  weekStart: Date;
  getClassesForDay: (idx: number) => GymClassItem[];
  isAuthenticated: boolean;
  onBook: (id: string) => void;
  onCancel: (id: string) => void;
  isBooking: boolean;
}) {
  const [activeDay, setActiveDay] = useState(new Date().getDay() - 1); // Monday = 0
  const activeDayIndex = activeDay >= 0 ? activeDay : 0;

  return (
    <div>
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {days.map((day, idx) => {
          const dayDate = addDays(weekStart, idx);
          const isToday = dayDate.toDateString() === new Date().toDateString();
          return (
            <button
              key={day}
              onClick={() => setActiveDay(idx)}
              className={`px-3 py-2 rounded-lg text-center min-w-[60px] transition-colors ${
                activeDayIndex === idx
                  ? 'bg-primary text-white'
                  : isToday ? 'bg-[#1A1A1A] border border-primary/50 text-gray-300'
                  : 'bg-[#1A1A1A] text-gray-400'
              }`}
            >
              <p className="text-xs font-semibold">{day}</p>
              <p className="text-xs">{format(dayDate, 'd')}</p>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {getClassesForDay(activeDayIndex).map((cls) => (
          <div
            key={cls.id}
            className={`bg-[#141414] border ${cls.isBooked ? 'border-primary/40' : 'border-[#2A2A2A]'} rounded-lg p-4`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs text-primary font-semibold">
                  {format(new Date(cls.startTime), 'h:mm a')} - {format(new Date(cls.endTime), 'h:mm a')}
                </span>
                <h3 className="text-white font-semibold mt-1">{cls.name}</h3>
              </div>
              <span className={`text-xs font-medium ${getSpotsColor(cls.spotsAvailable)}`}>
                {cls.spotsAvailable === 0 ? 'Full' : `${cls.spotsAvailable} spots`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {cls.type.replace(/_/g, ' ')}
              </span>
              <span>{cls.trainer?.name}</span>
              <span>{cls.location}</span>
            </div>
            {cls.isBooked ? (
              <button
                onClick={() => onCancel(cls.id)}
                className="w-full text-sm bg-green-500/20 text-green-500 rounded-lg py-2 hover:bg-green-500/30 transition-colors"
              >
                Booked ✓ — Tap to cancel
              </button>
            ) : cls.spotsAvailable > 0 ? (
              <button
                onClick={() => onBook(cls.id)}
                disabled={isBooking}
                className="w-full text-sm bg-primary text-white rounded-lg py-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isBooking ? 'Booking...' : 'Book This Class'}
              </button>
            ) : (
              <div className="w-full text-sm bg-red-500/20 text-red-400 rounded-lg py-2 text-center">
                Class Full
              </div>
            )}
          </div>
        ))}
        {getClassesForDay(activeDayIndex).length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="mx-auto mb-3" size={32} />
            <p>No classes scheduled for this day</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getSpotsColor(spots: number): string {
  if (spots >= 5) return 'text-green-500';
  if (spots >= 2) return 'text-amber-500';
  return 'text-red-500';
}