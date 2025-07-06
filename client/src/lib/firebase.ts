import { initializeApp } from "firebase/app";
   import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCmvlXkR-dSvsPOAQuDufOSyfahu8wIF70",
  authDomain: "wisely-app-7e07f.firebaseapp.com",
  projectId: "wisely-app-7e07f",
  storageBucket: "wisely-app-7e07f.firebasestorage.app",
  messagingSenderId: "711215523509",
  appId: "1:711215523509:web:aab7ef124263ba552600fc",
  measurementId: "G-1J3LSWR5XP"
};

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const googleProvider = new GoogleAuthProvider();