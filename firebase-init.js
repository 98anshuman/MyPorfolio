// Firebase Modular SDK Initialization (latest secure CDN versions)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJvmBntEOgcE4Fyz9r9wK80hE9DFCN2fc",
  authDomain: "myportfolio-b4106.firebaseapp.com",
  databaseURL: "https://myportfolio-b4106-default-rtdb.firebaseio.com",
  projectId: "myportfolio-b4106",
  storageBucket: "myportfolio-b4106.firebasestorage.app",
  messagingSenderId: "187456747117",
  appId: "1:187456747117:web:fed5e0ad9a327e7a787164",
  measurementId: "G-YJMYH87XRK"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
getAnalytics(app);

export { db };
