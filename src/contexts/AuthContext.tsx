import React, { createContext, useContext, useState, useEffect } from 'react';
// import AdminAuthService from '../services/userService';
import AdminAuthService, {
  Admin,
  AdminResponse,
} from '../services/adminAuthService';

interface AuthContextType {
  user: Admin | null;
  signIn: (email: string, password: string) => Promise<AdminResponse>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (AdminAuthService.isAuthenticated()) {
          // You might want to fetch user data here if needed
          const userId = localStorage.getItem('partner_id');
          // Set some basic user data from storage
          setUser({
            _id: userId || '',
            email: '', // You might want to store these in localStorage as well
            firstName: '',
            lastName: '',
            password: '',
            passwordConfirm: '',
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await AdminAuthService.login(email, password);
      setUser(response.data.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await AdminAuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
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
