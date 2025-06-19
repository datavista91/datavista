// firebase.ts (or whatever your config file is named)
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // Add this import
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCYnivsagQm8_ehui8Q4K6_CgGYKLq2vGI',
  authDomain: 'datavista-68ca1.firebaseapp.com',
  projectId: 'datavista-68ca1',
  storageBucket: 'datavista-68ca1.appspot.com',
  messagingSenderId: '1073784955200',
  appId: '1:1073784955200:web:46906d2b6335d4a83d9aa5',
  measurementId: 'G-S9KWL2092Z',
  databaseURL: 'https://datavista-68ca1-default-rtdb.firebaseio.com/', // Add your Realtime Database URL
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app); // Export the database instance

let analytics: ReturnType<typeof getAnalytics> | undefined = undefined;

analyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics };