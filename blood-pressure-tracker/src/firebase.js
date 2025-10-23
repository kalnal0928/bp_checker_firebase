import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKeNkwFTxm2gmekOlbeJlTcqPIy9ZNh-8",
  authDomain: "bloodpressuretracker-2a942.firebaseapp.com",
  projectId: "bloodpressuretracker-2a942",
  storageBucket: "bloodpressuretracker-2a942.firebasestorage.app",
  messagingSenderId: "136940945325",
  appId: "1:136940945325:web:dcc98fbec6987e63242b24",
  measurementId: "G-3RW25MS8JN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
