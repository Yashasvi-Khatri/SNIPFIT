import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  X, 
  Calendar,
  User,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'CLASS_CANCELLED' | 'MEMBERSHIP_REMINDER' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'INFO';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'All marked as read',
        description: 'All notifications have been marked as read.',
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
        variant: 'destructive',
      });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'BOOKING_CANCELLED':
      case 'CLASS_CANCELLED':
        return <X className="h-5 w-5 text-red-400" />;
      case 'MEMBERSHIP_REMINDER':
        return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      case 'PAYMENT_SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'PAYMENT_FAILED':
        return <X className="h-5 w-5 text-red-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return 'border-l-green-500 bg-green-500/5';
      case 'BOOKING_CANCELLED':
      case 'CLASS_CANCELLED':
        return 'border-l-red-500 bg-red-500/5';
      case 'MEMBERSHIP_REMINDER':
        return 'border-l-orange-500 bg-orange-500/5';
      case 'PAYMENT_SUCCESS':
        return 'border-l-green-500 bg-green-500/5';
      case 'PAYMENT_FAILED':
        return 'border-l-red-500 bg-red-500/5';
      default:
        return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-slate-400">Stay updated with your gym activity</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            className="border-slate-700 text-slate-300"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`
                cursor-pointer transition-all hover:bg-slate-700/30
                ${!notification.read ? getNotificationColor(notification.type) : ''}
                bg-slate-800/50 border-slate-700
              `}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {notification.title}
                          {!notification.read && (
                            <Badge className="ml-2 bg-purple-500/10 border-purple-500/20 text-purple-400">
                              New
                            </Badge>
                          )}
                        </h3>
                        <p className="text-slate-300 text-sm">{notification.message}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    {notification.link && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 p-0 h-auto text-purple-400 hover:text-purple-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(notification.link!);
                        }}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">You're all caught up!</h3>
              <p className="text-slate-400">No notifications to show right now.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}