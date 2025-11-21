// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAmL6ujzvuqvP3PozdVZfoKd475IQ-tvV4",
  authDomain: "gitmatch-20e6d.firebaseapp.com",
  projectId: "gitmatch-20e6d",
  storageBucket: "gitmatch-20e6d.firebasestorage.app",
  messagingSenderId: "1021880418142",
  appId: "1:1021880418142:web:f8dc7866352a986ae0d9cf",
  measurementId: "G-WG0425K2NK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const callback_url = "https://gitmatch-20e6d.firebaseapp.com/__/auth/handler"