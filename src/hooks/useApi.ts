import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

// User hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.users.getAll().then(res => res.data),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => apiClient.users.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.users.update(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'User updated',
        description: 'User information has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.error || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });
};

// Membership hooks
export const useMemberships = () => {
  return useQuery({
    queryKey: ['memberships'],
    queryFn: () => apiClient.memberships.getAll().then(res => res.data),
  });
};

export const useCreateMembership = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.memberships.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      toast({
        title: 'Membership created',
        description: 'New membership has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation failed',
        description: error.response?.data?.error || 'Failed to create membership',
        variant: 'destructive',
      });
    },
  });
};

// Gym Classes hooks
export const useGymClasses = (params?: { startDate?: string; endDate?: string; type?: string; trainerId?: string }) => {
  return useQuery({
    queryKey: ['classes', params],
    queryFn: () => apiClient.classes.getAll(params).then(res => res.data),
  });
};

export const useGymClass = (id: string) => {
  return useQuery({
    queryKey: ['class', id],
    queryFn: () => apiClient.classes.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useBookClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (classId: string) =>
      apiClient.classes.book(classId).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      toast({
        title: 'Booking confirmed',
        description: 'You have been successfully enrolled in the class.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Booking failed',
        description: error.response?.data?.error || 'Failed to book class',
        variant: 'destructive',
      });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (classId: string) =>
      apiClient.classes.cancelBooking(classId).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      toast({
        title: 'Booking cancelled',
        description: 'Your booking has been cancelled successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Cancellation failed',
        description: error.response?.data?.error || 'Failed to cancel booking',
        variant: 'destructive',
      });
    },
  });
};

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => apiClient.classes.getMyBookings().then(res => res.data),
  });
};

export const useCreateGymClass = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.classes.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: 'Class created',
        description: 'New gym class has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation failed',
        description: error.response?.data?.error || 'Failed to create class',
        variant: 'destructive',
      });
    },
  });
};

// Booking/Enrollment hooks
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.bookings.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast({
        title: 'Booking confirmed',
        description: 'You have been successfully enrolled in the class.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Booking failed',
        description: error.response?.data?.error || 'Failed to book class',
        variant: 'destructive',
      });
    },
  });
};

export const useUserBookings = (userId: string) => {
  return useQuery({
    queryKey: ['user-bookings', userId],
    queryFn: () => apiClient.bookings.getUserBookings(userId).then(res => res.data),
    enabled: !!userId,
  });
};

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.dashboard.getStats().then(res => res.data),
  });
};

// Member hooks
export const useMemberDashboard = () => {
  return useQuery({
    queryKey: ['member-dashboard'],
    queryFn: () => apiClient.members.getDashboard().then(res => res.data),
  });
};

export const useMemberCard = () => {
  return useQuery({
    queryKey: ['member-card'],
    queryFn: () => apiClient.members.getCard().then(res => res.data),
  });
};

// Workout hooks
export const useWorkouts = (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['workouts', params],
    queryFn: () => apiClient.workouts.getAll(params).then(res => res.data),
  });
};

export const useWorkout = (id: string) => {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: () => apiClient.workouts.getById(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useWorkoutStats = () => {
  return useQuery({
    queryKey: ['workout-stats'],
    queryFn: () => apiClient.workouts.getStats().then(res => res.data),
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      apiClient.workouts.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout-stats'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      toast({
        title: 'Workout saved',
        description: 'Your workout has been logged successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to save workout',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.workouts.update(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout-stats'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      toast({
        title: 'Workout updated',
        description: 'Your workout has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update workout',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.workouts.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout-stats'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      toast({
        title: 'Workout deleted',
        description: 'Your workout has been deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete workout',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

// Measurement hooks
export const useMeasurements = () => {
  return useQuery({
    queryKey: ['measurements'],
    queryFn: () => apiClient.measurements.getAll().then(res => res.data),
  });
};

export const useCreateMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      apiClient.measurements.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      toast({
        title: 'Measurement saved',
        description: 'Your measurement has been recorded successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to save measurement',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.measurements.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      toast({
        title: 'Measurement deleted',
        description: 'Your measurement has been deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete measurement',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

// Admin hooks
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.admin.getStats().then(res => res.data),
  });
};

export const useExpiringMembers = () => {
  return useQuery({
    queryKey: ['expiring-members'],
    queryFn: () => apiClient.admin.getExpiring().then(res => res.data),
  });
};

export const useMonthlyRevenue = () => {
  return useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: () => apiClient.admin.getMonthlyRevenue().then(res => res.data),
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.admin.deleteMember(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({
        title: 'Member deleted',
        description: 'Member has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.error || 'Failed to delete member',
        variant: 'destructive',
      });
    },
  });
};

// Auth hooks
export const useAuthMe = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiClient.auth.me().then((res: any) => res.data),
    retry: false,
  });
};

// Admin Auth hooks
export const useVerifyAdminSecurityCode = () => {
  return useMutation({
    mutationFn: ({ email, securityCode }: { email: string; securityCode: string }) =>
      apiClient.adminAuth.verifySecurityCode(email, securityCode).then(res => res.data),
  });
};

export const useSetAdminSecurityCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, currentCode, newCode }: { userId: string; currentCode?: string; newCode: string }) =>
      apiClient.adminAuth.setSecurityCode(userId, currentCode, newCode).then(res => res.data),
    onSuccess: () => {
      toast({
        title: 'Security code updated',
        description: 'Your admin security code has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update security code',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useAdminLoginHistory = (userId: string) => {
  return useQuery({
    queryKey: ['admin-login-history', userId],
    queryFn: () => apiClient.adminAuth.getLoginHistory(userId).then(res => res.data),
    enabled: !!userId,
  });
};

// Admin Invitations hooks
export const useInviteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) =>
      apiClient.adminInvitations.invite(email).then(res => res.data),
    onSuccess: () => {
      toast({
        title: 'Admin invitation sent',
        description: 'The invitation has been sent to the email address.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send invitation',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useAdminInvitations = () => {
  return useQuery({
    queryKey: ['admin-invitations'],
    queryFn: () => apiClient.adminInvitations.getAll().then(res => res.data),
  });
};

export const useAcceptAdminInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, name, password }: { token: string; name: string; password: string }) =>
      apiClient.adminInvitations.accept(token, { name, password }).then(res => res.data),
    onSuccess: (data) => {
      toast({
        title: 'Invitation accepted',
        description: 'You now have admin access to SNIPFIT!',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to accept invitation',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useCancelAdminInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.adminInvitations.cancel(id).then(res => res.data),
    onSuccess: () => {
      toast({
        title: 'Invitation cancelled',
        description: 'The admin invitation has been cancelled.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to cancel invitation',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

export const useResendAdminInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.adminInvitations.resend(id).then(res => res.data),
    onSuccess: () => {
      toast({
        title: 'Invitation resent',
        description: 'A new invitation has been sent.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to resend invitation',
        description: error.response?.data?.error || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};
