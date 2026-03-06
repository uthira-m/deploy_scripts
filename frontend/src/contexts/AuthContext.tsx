"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, personalAuthService } from '@/lib/api';

interface User {
  id: number;
  army_no: string;
  name: string;
  rank: string;
  unit?: string;
  email?: string;
  role: string;
  profile_id?: number | null;
  photo_url?: string;
  requiresPasswordChange?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresPasswordChange: boolean;
  login: (army_no: string, password: string, personal?: boolean) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle global authentication errors
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      if (event.detail?.message?.includes('Authentication failed')) {
        logout();
      }
    };

    window.addEventListener('auth-error' as any, handleAuthError);
    return () => {
      window.removeEventListener('auth-error' as any, handleAuthError);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        // Validate token with backend
        const isValid = await authService.validateToken();
        
        if (isValid) {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
        } else {
          // Token is invalid, clear storage
          logout();
        }
      }
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (army_no: string, password: string, personal = false) => {
    try {
      let response;
  
      if (personal) {
        response = await personalAuthService.login({ army_no, password });
      } else {
        response = await authService.login({ army_no, password });
      }
      
      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      setToken(response.token);
      setRequiresPasswordChange(!!response.user.requiresPasswordChange);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    // Use client-side navigation instead of page reload
    router.push('/login');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    requiresPasswordChange,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 