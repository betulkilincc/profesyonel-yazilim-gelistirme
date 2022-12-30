import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMJv4OBW1qBLdUm8-jMwVxpCN9rKRcw0M",
  authDomain: "profesyonel-yazilim-gelistirme.firebaseapp.com",
  projectId: "profesyonel-yazilim-gelistirme",
  storageBucket: "profesyonel-yazilim-gelistirme.appspot.com",
  messagingSenderId: "853896597328",
  appId: "1:853896597328:web:a0f428f0f18c977fde2655",
  measurementId: "G-HN0GB28CNG"
};

// Init Firebase
initializeApp(firebaseConfig);

// Init services
export const auth = getAuth();
