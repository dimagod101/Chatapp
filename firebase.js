// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  get,
  set
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC72WABeQ2e117WwxS7BAs_L1A2cIo0u0Y",
  authDomain: "messagingapp-9bac7.firebaseapp.com",
  databaseURL: "https://messagingapp-9bac7-default-rtdb.firebaseio.com/",
  projectId: "messagingapp-9bac7",
  storageBucket: "messagingapp-9bac7.appspot.com",
  messagingSenderId: "369463204028",
  appId: "1:369463204028:web:a932d813be7ac41f5b98b9"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Services
const db = getDatabase(app);
const auth = getAuth(app);

// ✅ References
const messagesRef = ref(db, "messages");
const usersRef = ref(db, "users");

// ✅ Anonymous Auth
signInAnonymously(auth)
  .then(() => {
    console.log("Signed in anonymously.");
  })
  .catch((error) => {
    console.error("Anonymous auth error:", error.code, error.message);
  });

// ✅ Auth State Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Authenticated user ID:", user.uid);
  } else {
    console.log("User signed out.");
  }
});

// ✅ Exported API
export {
  db,
  messagesRef,
  usersRef,
  auth,
  ref,
  push,
  onValue,
  remove,
  get,
  set
};