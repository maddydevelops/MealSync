// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXqZ8VAAMFbv2KaqUz0IOfD-OQnIvHwh4",
  authDomain: "mealsync-68d59.firebaseapp.com",
  projectId: "mealsync-68d59",
  storageBucket: "mealsync-68d59.firebasestorage.app",
  messagingSenderId: "485242424559",
  appId: "1:485242424559:web:8cf981faa62cb165addf1a",
  measurementId: "G-2X0KRQVHQW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);