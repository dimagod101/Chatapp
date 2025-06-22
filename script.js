import { db, ref, set, get, push, onValue, remove, auth } from "./firebase.js";

const getSHA256Hash = async (input) => {
  const textAsBuffer = new TextEncoder().encode(input);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", textAsBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((item) => item.toString(16).padStart(2, "0")).join("");
  return hash;
};

const MASTER_PASSWORD = "0d21c911528176264c20174a7f5eeedbd35990f9e57f7fdbee1422ad396917fb";
let currentUser = null;

// DOM Elements
const loginScreen = document.getElementById("login-screen");
const registerScreen = document.getElementById("register-screen");
const chatScreen = document.getElementById("chat-screen");

document.getElementById("go-to-register").addEventListener("click", (e) => {
  e.preventDefault();
  loginScreen.classList.add("hidden");
  registerScreen.classList.remove("hidden");
});

document.getElementById("back-to-login").addEventListener("click", (e) => {
  e.preventDefault();
  registerScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});

document.getElementById("login-button").addEventListener("click", loginUser);
document.getElementById("register-button").addEventListener("click", registerUser);

async function registerUser() {
  const master = document.getElementById("master-password").value.trim();
  const username = document.getElementById("register-username").value.trim();
  const password = await getSHA256Hash(document.getElementById("register-password").value);

  if (!master || !username || !password) return alert("Fill all fields.");
  if (await getSHA256Hash(master) !== MASTER_PASSWORD) return alert("Incorrect master password.");

  const userUID = auth.currentUser?.uid;
  if (!userUID) return alert("User not authenticated.");

  const usersSnapshot = await get(ref(db, "users"));
  for (const uid in usersSnapshot.val() || {}) {
    if (usersSnapshot.val()[uid].username === username) {
      return alert("Username already taken.");
    }
  }

  await set(ref(db, `users/${userUID}`), { username, password });

  currentUser = username;
  enterChat();
}

async function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) return alert("Fill all fields.");

  const hashed = await getSHA256Hash(password);
  const usersSnapshot = await get(ref(db, "users"));

  for (const uid in usersSnapshot.val() || {}) {
    const user = usersSnapshot.val()[uid];
    if (user.username === username && user.password === hashed) {
      currentUser = username;
      enterChat();
      return;
    }
  }

  alert("Invalid credentials.");
}

window.sendMessage = async () => {
  const message = document.getElementById("message").value.trim();
  if (!message) return;

  const uid = auth.currentUser?.uid;
  if (!uid) return alert("Not authenticated.");

  await push(ref(db, "messages"), {
    uid,
    message,
    time: new Date().toLocaleString()
  });

  document.getElementById("message").value = "";
};

onValue(ref(db, "messages"), async (snapshot) => {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  const allUsers = await get(ref(db, "users"));
  const userCache = {};
  for (const uid in allUsers.val() || {}) {
    userCache[uid] = allUsers.val()[uid].username;
  }

  for (const messageId in snapshot.val() || {}) {
    const msgData = snapshot.val()[messageId];
    const username = userCache[msgData.uid] || "Unknown";

    const msg = document.createElement("p");
    msg.textContent = `${username}: "${msgData.message}" , ${msgData.time}`;
    messagesDiv.appendChild(msg);
  }

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

function enterChat() {
  loginScreen.classList.add("hidden");
  registerScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");
}