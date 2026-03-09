// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqYBsffcXMKCC-Se-FMyUKvyRyeke8XwE",
  authDomain: "hotelpos-9e145.firebaseapp.com",
  projectId: "hotelpos-9e145",
  storageBucket: "hotelpos-9e145.firebasestorage.app",
  messagingSenderId: "122571750473",
  appId: "1:122571750473:web:985410b04685d7b6481398",
  measurementId: "G-GMTTMXG6GJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);