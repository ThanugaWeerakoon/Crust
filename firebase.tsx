// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0uX0ig4myMVu3oxB4kRG7QJ77gNO4JNs",
  authDomain: "crust-717fd.firebaseapp.com",
  projectId: "crust-717fd",
  storageBucket: "crust-717fd.firebasestorage.app",
  messagingSenderId: "1038475903579",
  appId: "1:1038475903579:web:ab39d4f39e03d13749357e",
  measurementId: "G-CGDB75SYNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);