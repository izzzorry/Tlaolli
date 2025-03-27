// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyC5RfGB1H6olHubSyO4ARAr-UPnFGCh8Kc",
  authDomain: "videogames-366f5.firebaseapp.com",
  projectId: "videogames-366f5",
  storageBucket: "videogames-366f5.appspot.com",
  messagingSenderId: "1022961712480",
  appId: "1:1022961712480:web:a05260cbf26fcc5db3b205"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
window.db = db;
