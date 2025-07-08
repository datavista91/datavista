import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import userSubscriptionService from '../services/userSubscriptionService';

type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string; // Add photoURL type
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<boolean>;
  signup: () => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '', // Add photoURL
        };
        setUser(userData);
        
        // Initialize user subscription for new users
        try {
          await userSubscriptionService.initializeUserSubscription(firebaseUser.uid);
        } catch (error) {
          console.error('Failed to initialize user subscription:', error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsLoading(false);
      // Redirect to dashboard after successful login
      window.location.replace('/dashboard');
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  // Signup is not needed with Google OAuth, but keep for interface compatibility
  const signup = login;

  const logout = async () => {
    setIsLoading(true);
    await signOut(auth);
    setUser(null);
    setIsLoading(false);
    window.location.replace('/'); // Redirect to landing page
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
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
