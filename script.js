import { db, ref, set, get, push, onValue, remove } from "./firebase.js";

const MASTER_PASSWORD = "Appicalat7&";
let currentUser = null;
let currentUID = null;

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
  const password = document.getElementById("register-password").value;

  if (!master || !username || !password) return alert("Fill all fields.");
  if (master !== MASTER_PASSWORD) return alert("Incorrect master password.");

  const usersRef = ref(db, "users");
  const snapshot = await get(usersRef);

  for (const uid in snapshot.val() || {}) {
    if (snapshot.val()[uid].username === username) {
      return alert("Username already taken.");
    }
  }

  const newUserRef = push(usersRef);
  await set(newUserRef, { username, password });

  currentUser = username;
  currentUID = newUserRef.key;
  enterChat();
}

async function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) return alert("Fill all fields.");

  const usersSnapshot = await get(ref(db, "users"));
  for (const uid in usersSnapshot.val() || {}) {
    const user = usersSnapshot.val()[uid];
    if (user.username === username && user.password === password) {
      currentUser = username;
      currentUID = uid;
      enterChat();
      return;
    }
  }

  alert("Invalid credentials.");
}

window.sendMessage = async () => {
  const message = document.getElementById("message").value.trim();
  if (!message) return;

  await push(ref(db, "messages"), {
    uid: currentUID,
    message,
    time: new Date().toLocaleString()
  });

  document.getElementById("message").value = "";
};

onValue(ref(db, "messages"), async (snapshot) => {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  const userCache = {};
  const allUsers = await get(ref(db, "users"));
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