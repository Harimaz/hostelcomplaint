// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyClRzntm9blP_HYXkBQ67h98EX38z1zGpA",
    authDomain: "hostelcomplaint-c1653.firebaseapp.com",
    projectId: "hostelcomplaint-c1653",
    storageBucket: "hostelcomplaint-c1653.firebasestorage.app",
    messagingSenderId: "340291551739",
    appId: "1:340291551739:web:b54a309eb01a36c8794b5e",
    measurementId: "G-NHBELHGHT4"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);