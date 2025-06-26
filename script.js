import {
  db, ref, set, get, push, onValue, remove,
  auth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged
} from "./firebase.js";

const getSHA256Hash = async (input) => {
  const buffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

const MASTER_PASSWORD = "0d21c911528176264c20174a7f5eeedbd35990f9e57f7fdbee1422ad396917fb";

// Page routing logic
document.addEventListener("DOMContentLoaded", () => {
  const isLoginPage = window.location.pathname.includes("index.html");
  const isRegisterPage = window.location.pathname.includes("register.html");
  const isChatPage = window.location.pathname.includes("chat.html");

  if (isLoginPage) {
    document.getElementById("login-button")?.addEventListener("click", loginUser);
  }

  if (isRegisterPage) {
    document.getElementById("register-button")?.addEventListener("click", registerUser);
  }

  if (isChatPage) {
    setupChat();
  }
});

// Register new user
async function registerUser() {
  const master = document.getElementById("master-password").value.trim();
  const username = document.getElementById("register-username").value.trim();
  const password = document.getElementById("register-password").value;

  if (!master || !username || !password) return alert("Fill all fields.");
  if (await getSHA256Hash(master) !== MASTER_PASSWORD) return alert("Incorrect master password.");

  const email = `${username}@myapp.local`;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Store only the username in the DB, NOT the password
    await set(ref(db, `users/${uid}`), { username });

    window.location.href = "chat.html";
  } catch (error) {
    console.error("Register error:", error);
    alert("Registration failed: " + error.message);
  }
}

// Login existing user
async function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) return alert("Fill all fields.");

  const email = `${username}@myapp.local`;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem("dc89bc9e-348a-475b-9e68-b04be0b27e1c", "6bd32144-8f15-488c-8af2-630eba51fb5c");
    window.location.href = "chat.html";
  } catch (error) {
    console.error("Login error:", error);
    alert("Invalid credentials: " + error.message);
  }
}

// Logout current user
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          sessionStorage.clear();
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Sign-out error:", error);
          alert("Logout failed.");
        });
    });
  }
});

// Setup chat interface for authenticated users
function setupChat() {
  const messagesDiv = document.getElementById("messages");
  if (!messagesDiv) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("You must be logged in.");
      window.location.href = "index.html";
      return;
    }

    const currentUID = user.uid;

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
  });
}

// Send message to database
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

// Delete message by ID
window.deleteMessage = (messageId) => {
  const messageRef = ref(db, `messages/${messageId}`);
  if (confirm("Are you sure you want to delete this message?")) {
    remove(messageRef)
      .then(() => console.log("Message deleted"))
      .catch((error) => console.error("Error deleting message:", error));
  }
};