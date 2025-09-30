import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/common/useAuth';
import Cookies from 'js-cookie';
import { clearAuthData } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage AND cookie)
    const storedUser = localStorage.getItem('user');
    const token = Cookies.get('token');
    
    // Only consider user as logged in if both token and user data exist
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else if (storedUser && !token) {
      // If user data exists but token doesn't, clear everything
      clearAuthData();
    }
    setIsLoading(false);
    
    // Listen for storage events from the custom useAuth hook
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        if (event.newValue) {
          setUser(JSON.parse(event.newValue));
        } else {
          setUser(null);
        }
      }
    };
    
    // Also listen for custom storage events dispatched by useAuth
    const handleCustomStorageEvent = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleCustomStorageEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorageEvent);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data (in a real app, this would come from an API)
      const userData: User = {
        id: 'user-1',
        name: 'Demo User',
        email,
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Import postRequest from apiRequest
      const { postRequest } = await import('@/services/apiRequest');
      
      // Call the /register API endpoint with the required structure
      const response = await postRequest<{ token: string; user: User }>('/register', {
        name,
        email,
        password,
        password_confirmation: password
      });
      
      // Handle the response
      if (response && response.user) {
        // Save the token and user data
        Cookies.set('token', response.token, { 
          expires: 30, // Default to 30 days
          secure: true,
          sameSite: 'Strict'
        });
        
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthData(); // Use the clearAuthData function to ensure consistent logout behavior
  };

  // Function to update user profile data
  const updateUserProfile = (userData: Partial<User>) => {
    if (!user) return;
    
    // Create updated user object
    const updatedUser = { ...user, ...userData };
    
    // Update state and localStorage
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUserProfile
      }}
    >
      {children}
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