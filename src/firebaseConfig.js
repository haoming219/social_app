// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAlI1-RYm5Qshc-rmqjbgUqBA1Me2YJrqY",
    authDomain: "haomingricebook.firebaseapp.com",
    projectId: "haomingricebook",
    storageBucket: "haomingricebook.firebasestorage.app",
    messagingSenderId: "656803793353",
    appId: "1:656803793353:web:e8d237d2006c2a454a0018"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;