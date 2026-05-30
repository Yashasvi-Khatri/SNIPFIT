import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { apiClient, setAccessToken, getAccessToken, setAuthUserHint } from '@/lib/api';

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
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearStoredSupabaseSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith('sb-') && key.endsWith('-auth-token'))
    .forEach((key) => window.localStorage.removeItem(key));
};

const buildUserFromSession = (session: Session): User => {
  const metadata = session.user.user_metadata ?? {};
  const email = session.user.email ?? '';

  return {
    id: session.user.id,
    email,
    name: (metadata.name as string | undefined) || email.split('@')[0] || 'User',
    role: (metadata.role as string | undefined) || 'MEMBER',
    createdAt: session.user.created_at || new Date().toISOString(),
    updatedAt: session.user.updated_at || session.user.created_at || new Date().toISOString(),
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastSyncedAccessToken = useRef<string | null>(null);

  const handleUnauthorized = async () => {
    setAccessToken(null);
    setAuthUserHint(null);
    setUser(null);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase sign out error:', error);
    }
  };

  const syncBackendUser = async (session: Session): Promise<User> => {
    const fallbackUser = buildUserFromSession(session);
    setUser(fallbackUser);
    setAuthUserHint({ email: fallbackUser.email, name: fallbackUser.name });

    if (lastSyncedAccessToken.current === session.access_token) {
      return fallbackUser;
    }

    lastSyncedAccessToken.current = session.access_token;

    try {
      const meResponse = await apiClient.auth.me(session.access_token);

      if (meResponse.data.success && meResponse.data.user) {
        setUser(meResponse.data.user);
        return meResponse.data.user;
      }
    } catch (apiError: any) {
      console.warn('Backend profile sync skipped:', apiError?.response?.data?.error || apiError.message);
      // Keep the Supabase user as a fallback if the backend sync is temporarily unavailable.
    }

    return fallbackUser;
  };

  // On app load, try to restore session using Supabase
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase session error:', error);
          clearStoredSupabaseSession();
          setAccessToken(null);
          setAuthUserHint(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          await syncBackendUser(session);
          setAccessToken(session.access_token);
        }
      } catch (error) {
        console.error('Session restore error:', error);
        // No valid session, user is not logged in
        setAccessToken(null);
        setAuthUserHint(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await syncBackendUser(session);
        setAccessToken(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setAccessToken(null);
        setAuthUserHint(null);
        setUser(null);
      }
    });

    const handleUnauthorizedEvent = () => {
      void handleUnauthorized();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('snipfit:unauthorized', handleUnauthorizedEvent);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('snipfit:unauthorized', handleUnauthorizedEvent);
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        const loggedInUser = await syncBackendUser(data.session);
        setAccessToken(data.session.access_token);
        
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });

        return loggedInUser;
      }

      return null;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.session) {
        await syncBackendUser(data.session);
        setAccessToken(data.session.access_token);
        
        toast({
          title: 'Registration successful',
          description: 'Your account has been created!',
        });
      } else {
        // Email confirmation required
        toast({
          title: 'Registration successful',
          description: 'Please check your email to confirm your account.',
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
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
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setAuthUserHint(null);
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
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
