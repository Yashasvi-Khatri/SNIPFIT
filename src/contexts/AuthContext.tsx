import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Removed useNavigate from here and will pass navigation as callbacks

  useEffect(() => {
    // Check for existing session on initial load
    const checkAuth = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
          // In a real app, validate token with the server
          const userData = JSON.parse(localStorage.getItem('userData') || 'null');
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - in a real app, this would come from your API
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0],
      };
      
      // Store the token and user data
      localStorage.setItem('authToken', 'dummy-jwt-token');
      localStorage.setItem('userData', JSON.stringify(mockUser));
      
      setUser(mockUser);
      toast({
        title: 'Login successful',
        description: 'Welcome back to Snipfit!',
      });
      
      return mockUser; // Return user data to handle navigation in the component
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // const response = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - in a real app, this would come from your API
      const mockUser = {
        id: '1',
        email,
        name,
      };
      
      // Store the token and user data
      localStorage.setItem('authToken', 'dummy-jwt-token');
      localStorage.setItem('userData', JSON.stringify(mockUser));
      
      setUser(mockUser);
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully!',
      });
      
      return mockUser; // Return user data to handle navigation in the component
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    // Navigation should be handled by the component that calls logout
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
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
