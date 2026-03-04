// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCVwGXVYRM2CqR7hjR1yUK2RDes5wPyJEo",
  authDomain: "pkkm-b77e4.firebaseapp.com",
  projectId: "pkkm-b77e4",
  storageBucket: "pkkm-b77e4.firebasestorage.app",
  messagingSenderId: "179746749688",
  appId: "1:179746749688:web:d2834944085a0d848c0f0d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
