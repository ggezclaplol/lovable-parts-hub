import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials
const DEMO_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'admin@demo.com',
    password: 'admin123',
    user: {
      id: 'admin-001',
      name: 'Admin User',
      email: 'admin@demo.com',
      role: 'admin',
    },
  },
  {
    email: 'user@demo.com',
    password: 'user123',
    user: {
      id: 'user-001',
      name: 'Demo User',
      email: 'user@demo.com',
      role: 'user',
    },
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('demo_user');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('demo_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const demoUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (demoUser) {
      localStorage.setItem('demo_user', JSON.stringify(demoUser.user));
      setUser(demoUser.user);
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password. Try admin@demo.com / admin123 or user@demo.com / user123' };
  };

  const logout = () => {
    localStorage.removeItem('demo_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
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
