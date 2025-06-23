import { db, ref, set, get, push, onValue, remove, auth } from "./firebase.js";

// Utility: Hash function
const getSHA256Hash = async (input) => {
  const buffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

const MASTER_PASSWORD = "0d21c911528176264c20174a7f5eeedbd35990f9e57f7fdbee1422ad396917fb";
let currentUser = null;

// Run logic based on page
document.addEventListener("DOMContentLoaded", () => {
  const isLoginPage = window.location.pathname.includes("index.html");
  const isRegisterPage = window.location.pathname.includes("register.html");
  const isChatPage = window.location.pathname.includes("chat.html");

  if (isLoginPage) {
    const loginBtn = document.getElementById("login-button");
    if (loginBtn) loginBtn.addEventListener("click", loginUser);
  }

  if (isRegisterPage) {
    const registerBtn = document.getElementById("register-button");
    if (registerBtn) registerBtn.addEventListener("click", registerUser);
  }

  if (isChatPage) {
    setupChat();
  }
});

// Register user
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
  window.location.href = "chat.html";
}

// Login user
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
      window.location.href = "chat.html";
      return;
    }
  }

  alert("Invalid credentials.");
}

// Setup chat screen
function setupChat() {
  const currentUID = auth.currentUser?.uid;
  const messagesDiv = document.getElementById("messages");

  if (!messagesDiv) return;

  // Load & listen for messages
  onValue(ref(db, "messages"), async (snapshot) => {
    messagesDiv.innerHTML = "";

    const users = (await get(ref(db, "users"))).val() || {};
    const userCache = {};
    for (const uid in users) {
      userCache[uid] = users[uid].username;
    }

    const data = snapshot.val() || {};
    for (const messageId in data) {
      const msgData = data[messageId];
      const username = userCache[msgData.uid] || "Unknown";

      const msg = document.createElement("p");
      msg.textContent = `${username}: "${msgData.message}" , ${msgData.time}`;

      if (msgData.uid === currentUID) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.style.marginLeft = "10px";
        deleteButton.onclick = () => deleteMessage(messageId);
        msg.appendChild(deleteButton);
      }

      messagesDiv.appendChild(msg);
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Send message (attachable to button in HTML)
window.sendMessage = async () => {
  const input = document.getElementById("message");
  const message = input?.value.trim();
  if (!message) return;

  const uid = auth.currentUser?.uid;
  if (!uid) return alert("Not authenticated.");

  await push(ref(db, "messages"), {
    uid,
    message,
    time: new Date().toLocaleString()
  });

  input.value = "";
};

// Delete message
window.deleteMessage = (messageId) => {
  const messageRef = ref(db, `messages/${messageId}`);
  if (confirm("Are you sure you want to delete this message?")) {
    remove(messageRef)
      .then(() => console.log("Message deleted successfully"))
      .catch((error) => console.error("Error deleting message:", error));
  }
};