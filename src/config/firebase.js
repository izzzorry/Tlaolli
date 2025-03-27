// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5RfGB1H6olHubSyO4ARAr-UPnFGCh8Kc",
  authDomain: "videogames-366f5.firebaseapp.com",
  projectId: "videogames-366f5",
  storageBucket: "videogames-366f5.firebasestorage.app",
  messagingSenderId: "1022961712480",
  appId: "1:1022961712480:web:a05260cbf26fcc5db3b205"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);