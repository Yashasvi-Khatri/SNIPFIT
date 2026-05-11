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
export const useGymClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => apiClient.classes.getAll().then(res => res.data),
  });
};

export const useGymClass = (id: string) => {
  return useQuery({
    queryKey: ['class', id],
    queryFn: () => apiClient.classes.getById(id).then(res => res.data),
    enabled: !!id,
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

// Auth hooks
export const useAuthLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.auth.login(email, password).then(res => res.data),
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast({
        title: 'Login successful',
        description: 'Welcome back to Snipfit!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.response?.data?.error || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });
};

export const useAuthRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      apiClient.auth.register(name, email, password).then(res => res.data),
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.error || 'Failed to create account',
        variant: 'destructive',
      });
    },
  });
};

export const useAuthMe = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiClient.auth.me().then(res => res.data),
    retry: false,
  });
};
