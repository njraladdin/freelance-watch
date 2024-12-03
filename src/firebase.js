// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error('Firebase initialization error', error.stack);
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Add these helper functions to firebase.js
export const getProfilePath = (profileId) => `profiles/${profileId}`;
export const getRecordsPath = (profileId, monthKey) => `profiles/${profileId}/records/${monthKey}`;
export const getStatsPath = (profileId) => `profiles/${profileId}/stats/current`;
export const getGoalsPath = (profileId, monthKey) => `profiles/${profileId}/goals/${monthKey}`;

// Add this helper function
export const calculateMonthlyAverage = (recentMonths) => {
  if (!recentMonths || typeof recentMonths !== 'object') return 0;
  
  const today = new Date();
  const monthsWithIncome = [];
  
  // Look at last 7 months (current + past 6)
  for (let i = 0; i <= 6; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const monthIncome = recentMonths[monthKey] || 0;
    if (monthIncome > 0) {
      monthsWithIncome.push(monthIncome);
    }
  }
  
  if (monthsWithIncome.length === 0) return 0;
  
  const average = monthsWithIncome.reduce((sum, val) => sum + val, 0) / monthsWithIncome.length;
  return Math.round(average);
};

// Profile document structure:
// profiles/{profileId}
// {
//   name: string,
//   userId: string,
//   tagline: string,
//   defaultGoal: number,
//   createdAt: timestamp
// }

// Monthly records subcollection:
// profiles/{profileId}/records/{YYYY-MM}
// {
//   days: {
//     "1": { earnings: number, projectsCount: number },
//     "2": { earnings: number, projectsCount: number },
//     ...
//   },
//   totalEarnings: number,
//   averageDailyEarnings: number,
//   projectsCompleted: number
// }

// Stats subcollection (for quick access):
// profiles/{profileId}/stats/current
// {
//   monthlyAverages: {
//     "2024-01": number,
//     "2024-02": number,
//     ...
//   },
//   lastUpdated: timestamp
// }

// Goals subcollection:
// profiles/{profileId}/goals/{YYYY-MM}
// {
//   amount: number,
//   updatedAt: timestamp
// }