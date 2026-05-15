import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { apiClient, setAccessToken, getAccessToken } from '@/lib/api';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load, try to restore session using refresh token
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Call refresh endpoint to get new access token
        const response = await apiClient.auth.refresh();
        
        if (response.data.success && response.data.accessToken) {
          setAccessToken(response.data.accessToken);
          
          // Fetch user data
          const meResponse = await apiClient.auth.me();
          
          if (meResponse.data.success && meResponse.data.user) {
            setUser(meResponse.data.user);
          }
        }
      } catch (error) {
        // No valid refresh token, user is not logged in
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.auth.login(email, password);
      
      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.auth.register(name, email, password, phone);
      
      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        toast({
          title: 'Registration successful',
          description: 'Your account has been created!',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      // Ignore logout errors, just clear local state
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
      // Navigation should be handled by the component that calls logout
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, accessToken: getAccessToken(), login, register, logout, isLoading, isAuthenticated }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
