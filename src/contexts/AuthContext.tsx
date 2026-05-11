import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuthLogin, useAuthRegister, useAuthMe } from '@/hooks/useApi';

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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loginMutation = useAuthLogin();
  const registerMutation = useAuthRegister();
  const { data: userData, isLoading: authLoading } = useAuthMe();

  useEffect(() => {
    if (!authLoading) {
      if (userData?.user) {
        setUser(userData.user);
      } else {
        // Check for existing session in localStorage as fallback
        const token = localStorage.getItem('authToken');
        const storedUserData = localStorage.getItem('userData');
        if (token && storedUserData) {
          try {
            const parsedUser = JSON.parse(storedUserData);
            setUser(parsedUser);
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        }
      }
      setLoading(false);
    }
  }, [userData, authLoading]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await loginMutation.mutateAsync({ email, password });
      // The mutation handles token storage and user data
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedUser = JSON.parse(storedUserData);
        setUser(parsedUser);
      }
    } catch (error) {
      // Error handling is done in the mutation
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      await registerMutation.mutateAsync({ name, email, password });
      // The mutation handles token storage and user data
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedUser = JSON.parse(storedUserData);
        setUser(parsedUser);
      }
    } catch (error) {
      // Error handling is done in the mutation
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
