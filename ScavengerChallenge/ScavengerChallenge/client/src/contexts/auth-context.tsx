import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type User = {
  id: number;
  username: string;
  isAdmin: boolean;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const userData = await apiRequest('POST', '/api/auth/login', { username, password });
      setUser(userData as User);
      toast({
        title: 'Success',
        description: 'You have been logged in successfully',
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to login',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const userData = await apiRequest('POST', '/api/auth/register', { username, password });
      setUser(userData as User);
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      toast({
        title: 'Success',
        description: 'You have been logged out',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}