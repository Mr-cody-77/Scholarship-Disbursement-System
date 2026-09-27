import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDBuelLIkUgYVAGCXu3QavuHsNDUejF2EA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "scholarship-disbursement-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "scholarship-disbursement-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "scholarship-disbursement-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "601280860171",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:601280860171:web:7eb2646914ec3c26df770e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-N1E33X8KSY",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://scholarship-disbursement-app-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const database = getDatabase(app);
const functions = getFunctions(app);

export { 
  db, 
  auth, 
  database, 
  functions 
};
export default app;