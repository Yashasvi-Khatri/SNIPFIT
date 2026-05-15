import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Loader2, Dumbbell } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { apiClient } from '@/lib/api';

export interface GymClassTrainer {
  id: string;
  name: string;
  role: string;
}

export interface GymClassItem {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  capacity: number;
  location: string;
  description?: string | null;
  trainer: GymClassTrainer;
  _count?: { bookings: number };
}

export interface ScheduleProps {
  className?: string;
}

export default function Schedule({ className = '' }: ScheduleProps) {
  const [classes, setClasses] = useState<GymClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiClient.classes.getAll();
        const data = response.data as { success: boolean; classes: GymClassItem[] };
        setClasses(data.classes ?? []);
      } catch {
        setError('Unable to load class schedule. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className={`min-h-screen bg-[#0A0A0A] ${className}`}>
      <Helmet>
        <title>Class Schedule | SNIPFIT Gym Rohini</title>
        <meta name="description" content="View upcoming gym classes at SNIPFIT Rohini." />
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
          <Link to="/" className="btn-ghost text-sm">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="section-padding">
        <div className="container-max">
          <div className="mb-12 text-center">
            <p className="section-tag">CLASS TIMETABLE</p>
            <h1 className="text-4xl font-bold text-white">
              UPCOMING <span className="gradient-text">CLASSES</span>
            </h1>
            <p className="mt-4 text-gray-450">
              Book your spot in our group classes and training sessions
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="card mx-auto max-w-lg p-8 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!isLoading && !error && classes.length === 0 && (
            <div className="card mx-auto max-w-lg p-8 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-550" />
              <p className="text-gray-450">No upcoming classes scheduled. Check back soon!</p>
            </div>
          )}

          {!isLoading && !error && classes.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((gymClass) => {
                const booked = gymClass._count?.bookings ?? 0;
                const spotsLeft = gymClass.capacity - booked;
                return (
                  <div key={gymClass.id} className="card card-hover p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {gymClass.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-550">
                        {spotsLeft} spots left
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-white">{gymClass.name}</h3>
                    {gymClass.description && (
                      <p className="mb-4 text-sm text-gray-450">{gymClass.description}</p>
                    )}
                    <div className="space-y-2 text-sm text-gray-450">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {format(new Date(gymClass.startTime), 'EEE, MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        {format(new Date(gymClass.startTime), 'h:mm a')} –{' '}
                        {format(new Date(gymClass.endTime), 'h:mm a')}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {gymClass.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        {gymClass.trainer.name} · {gymClass.trainer.role}
                      </div>
                    </div>
                    <Link to="/login" className="btn-primary mt-4 block w-full text-center text-sm">
                      Book Class
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
