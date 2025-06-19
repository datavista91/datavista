import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  auth, 
  googleProvider, 
  database 
} from '../firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
  AuthError,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth';
import { 
  ref, 
  set, 
  get, 
  push,
  DataSnapshot 
} from 'firebase/database';

type UserPlan = {
  name: string;
  status: 'active' | 'canceled' | 'expired';
  startDate: string;
  endDate: string;
  billingPeriod: 'monthly' | 'annual';
  lastPaymentId?: string;
};

type PaymentDetails = {
  id?: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  planName: string;
  billingPeriod: 'monthly' | 'annual';
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  transactionId?: string;
  receiptUrl?: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt?: string;
  lastLogin?: string;
  currentPlan?: UserPlan;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<boolean>;
  signup: () => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  recordPayment: (paymentData: Omit<PaymentDetails, 'createdAt' | 'status'> & { status?: PaymentDetails['status'] }) => Promise<string>;
  updateSubscription: (subscriptionData: UserPlan) => Promise<void>;
  getPaymentHistory: () => Promise<PaymentDetails[]>;
  checkSubscriptionStatus: () => Promise<UserPlan | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth persistence
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        console.error('Persistence initialization error:', err);
        setError('Failed to initialize authentication');
      }
    };
    initializeAuth();
  }, []);

  const storeUserData = useCallback(async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
      const userRef = ref(database, `users/${firebaseUser.uid}`);
      const userSnapshot = await get(userRef);
      
      const userData: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        lastLogin: new Date().toISOString(),
        ...(!userSnapshot.exists() && { createdAt: new Date().toISOString() })
      };

      await set(userRef, userData);
      return userData;
    } catch (err) {
      console.error('Error storing user data:', err);
      throw new Error('Failed to store user data');
    }
  }, []);

  const checkSubscriptionStatus = useCallback(async (userId: string): Promise<UserPlan | null> => {
    try {
      const subscriptionRef = ref(database, `users/${userId}/currentPlan`);
      const snapshot = await get(subscriptionRef);
      
      if (!snapshot.exists()) return null;
      
      const subscription = snapshot.val() as UserPlan;
      const now = new Date();
      const endDate = new Date(subscription.endDate);

      // Check if subscription is expired
      if (endDate < now && subscription.status !== 'expired') {
        const updatedSubscription: UserPlan = {
          ...subscription,
          status: 'expired'
        };
        await set(subscriptionRef, updatedSubscription);
        return updatedSubscription;
      }
      
      return subscription;
    } catch (err) {
      console.error('Error checking subscription:', err);
      throw new Error('Failed to check subscription status');
    }
  }, []);

  const recordPayment = useCallback(async (
    paymentData: Omit<PaymentDetails, 'createdAt' | 'status'> & { status?: PaymentDetails['status'] }
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const paymentsRef = ref(database, `users/${user.id}/payments`);
      const newPaymentRef = push(paymentsRef);
      
      const completePaymentData: PaymentDetails = {
        ...paymentData,
        status: paymentData.status || 'completed',
        createdAt: new Date().toISOString()
      };
      
      await set(newPaymentRef, completePaymentData);
      return newPaymentRef.key!;
    } catch (err) {
      console.error('Error recording payment:', err);
      throw new Error('Failed to record payment');
    }
  }, [user]);

  const updateSubscription = useCallback(async (subscriptionData: UserPlan): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const userRef = ref(database, `users/${user.id}/currentPlan`);
      await set(userRef, subscriptionData);
      
      // Update local user state
      setUser(prev => prev ? { ...prev, currentPlan: subscriptionData } : null);
    } catch (err) {
      console.error('Error updating subscription:', err);
      throw new Error('Failed to update subscription');
    }
  }, [user]);

  const getPaymentHistory = useCallback(async (): Promise<PaymentDetails[]> => {
    if (!user) return [];
    
    try {
      const paymentsRef = ref(database, `users/${user.id}/payments`);
      const snapshot = await get(paymentsRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const payments: PaymentDetails[] = [];
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        payments.push({
          id: childSnapshot.key!,
          ...childSnapshot.val()
        });
      });
      
      return payments;
    } catch (err) {
      console.error('Error fetching payment history:', err);
      throw new Error('Failed to get payment history');
    }
  }, [user]);

  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser | null) => {
    try {
      if (firebaseUser) {
        const userData = await storeUserData(firebaseUser);
        const subscription = await checkSubscriptionStatus(firebaseUser.uid);
        setUser({
          ...userData,
          currentPlan: subscription || undefined
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth state change error:', err);
      setError('Failed to process authentication state');
    } finally {
      setIsLoading(false);
    }
  }, [storeUserData, checkSubscriptionStatus]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
  }, [handleAuthStateChange]);

  const login = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Configure Google provider
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result: UserCredential = await signInWithPopup(auth, provider);
      await storeUserData(result.user);
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Login failed';
      
      if (err instanceof Error) {
        console.error('Login error:', err);
        
        const authError = err as AuthError;
        if (authError.code) {
          switch (authError.code) {
            case 'auth/popup-blocked':
              errorMessage = 'Popup was blocked by your browser. Please allow popups for this site.';
              break;
            case 'auth/popup-closed-by-user':
              errorMessage = 'Login popup was closed before completing';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your connection.';
              break;
            case 'auth/cancelled-popup-request':
            case 'auth/popup-closed-by-user':
              errorMessage = 'Login process was cancelled';
              break;
            default:
              errorMessage = `Login error: ${authError.message}`;
          }
        }
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storeUserData]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    signup: login,
    logout,
    isAuthenticated: !!user,
    recordPayment,
    updateSubscription,
    getPaymentHistory,
    checkSubscriptionStatus: async () => {
      if (!user) return null;
      return checkSubscriptionStatus(user.id);
    },
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};