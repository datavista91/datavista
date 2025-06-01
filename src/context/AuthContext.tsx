import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    setIsLoading(true);
    
    return new Promise(resolve => {
      setTimeout(() => {
        // For demo purposes, accept any login with an email format
        if (email.includes('@')) {
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          const foundUser = storedUsers.find((u: any) => u.email === email);
          
          if (foundUser && foundUser.password === password) {
            const userData = {
              id: foundUser.id,
              name: foundUser.name,
              email: foundUser.email
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setIsLoading(false);
            resolve(true);
          } else {
            setIsLoading(false);
            resolve(false);
          }
        } else {
          setIsLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    setIsLoading(true);
    
    return new Promise(resolve => {
      setTimeout(() => {
        if (name && email.includes('@') && password.length >= 6) {
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          
          // Check if user already exists
          if (storedUsers.some((u: any) => u.email === email)) {
            setIsLoading(false);
            resolve(false);
            return;
          }
          
          const newUser = {
            id: `user-${Date.now()}`,
            name,
            email,
            password
          };
          
          // Store user in localStorage
          localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));
          
          // Login the user
          const userData = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          setIsLoading(false);
          resolve(true);
        } else {
          setIsLoading(false);
          resolve(false);
        }
      }, 1500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
