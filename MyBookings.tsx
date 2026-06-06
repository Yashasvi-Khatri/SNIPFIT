import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface BookingClass {
  id: string; name: string; type: string; location: string;
  description: string | null; startTime: string; endTime: string; trainerName: string;
}
interface Booking {
  id: string; status: string; bookedAt: string; class: BookingClass;
}
interface BookingsData { upcoming: Booking[]; past: Booking[]; }

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-500/10 text-green-400 border-green-500/20',
  ATTENDED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CANCELLED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  NO_SHOW: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TYPE_COLORS: Record<string, string> = {
  YOGA: 'bg-purple-500/10 text-purple-400',
  STRENGTH: 'bg-red-500/10 text-red-400',
  CARDIO: 'bg-orange-500/10 text-orange-400',
  MMA: 'bg-yellow-500/10 text-yellow-400',
  HIIT: 'bg-pink-500/10 text-pink-400',
  ZUMBA: 'bg-teal-500/10 text-teal-400',
  BARRE: 'bg-indigo-500/10 text-indigo-400',
  PERSONAL_TRAINING: 'bg-green-500/10 text-green-400',
  NUTRITION: 'bg-lime-500/10 text-lime-400',
};

function BookingCard({ booking, onCancel, isPast }: { booking: Booking; onCancel?: (classId: string) => void; isPast: boolean }) {
  const startTime = new Date(booking.class.startTime);
  const hoursUntilClass = differenceInHours(startTime, new Date());
  const canCancel = hoursUntilClass > 2;
  const soonish = hoursUntilClass <= 1 && hoursUntilClass >= 0;

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#3A3A3A] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-white font-semibold">{booking.class.name}</h3>
            {soonish && (
              <span className="text-xs bg-[#FF6B2C]/10 text-[#FF6B2C] border border-[#FF6B2C]/20 px-2 py-0.5 rounded-full animate-pulse">
                Join Soon
              </span>
            )}
          </div>
          <span className={cn('text-xs px-2 py-0.5 rounded-full border', TYPE_COLORS[booking.class.type] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
            {booking.class.type.replace('_', ' ')}
          </span>
        </div>
        <span className={cn('text-xs px-2 py-0.5 rounded-full border shrink-0', STATUS_STYLES[booking.status] ?? STATUS_STYLES.CONFIRMED)}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{format(startTime, 'dd MMM, h:mm a')} — {format(new Date(booking.class.endTime), 'h:mm a')}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{booking.class.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <User className="h-3.5 w-3.5 shrink-0" />
          <span>{booking.class.trainerName}</span>
        </div>
      </div>

      {!isPast && onCancel && (
        <div className="flex items-center justify-between border-t border-[#2A2A2A] pt-3">
          <p className="text-gray-600 text-xs">
            Booked {formatDistanceToNow(new Date(booking.bookedAt), { addSuffix: true })}
          </p>
          {canCancel ? (
            <button
              onClick={() => onCancel(booking.class.id)}
              className="text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Cancel Booking
            </button>
          ) : (
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <AlertCircle className="h-3 w-3" />
              <span>Cannot cancel within 2 hours</span>
            </div>
          )}
        </div>
      )}
      {isPast && (
        <div className="border-t border-[#2A2A2A] pt-3">
          <p className="text-gray-600 text-xs">
            {formatDistanceToNow(startTime, { addSuffix: true })}
          </p>
        </div>
      )}
    </div>
  );
}

export default function MyBookings() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/api/classes/my-bookings');
      return res.data.data as BookingsData;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (classId: string) => api.delete(`/api/classes/${classId}/book`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      toast.success('Booking cancelled');
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err.response?.data?.error ?? 'Failed to cancel booking');
    },
  });

  const upcoming = data?.upcoming ?? [];
  const past = data?.past ?? [];
  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 lg:p-8">
      <Helmet>
        <title>My Bookings | SNIPFIT</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white mb-6">My Bookings</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 mb-6">
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors',
                tab === t ? 'bg-[#FF6B2C] text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              {t} {t === 'upcoming' ? `(${upcoming.length})` : `(${past.length})`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[#1A1A1A] rounded-xl animate-pulse" />)}
          </div>
        ) : shown.length > 0 ? (
          <div className="space-y-4">
            {shown.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                isPast={tab === 'past'}
                onCancel={tab === 'upcoming' ? (classId) => cancelMutation.mutate(classId) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">
              {tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </p>
            {tab === 'upcoming' && (
              <Link to="/schedule" className="text-[#FF6B2C] text-sm hover:underline">
                Browse the class schedule →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
