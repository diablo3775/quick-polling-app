// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7RA-8Swj__dO3Qf3tUrb8zeG_huoQyg8",
  authDomain: "quick-polling-app.firebaseapp.com",
  projectId: "quick-polling-app",
  storageBucket: "quick-polling-app.firebasestorage.app",
  messagingSenderId: "94879272963",
  appId: "1:94879272963:web:b47c56307578d9b6093e36",
  measurementId: "G-JFYDNK5ND6"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);



