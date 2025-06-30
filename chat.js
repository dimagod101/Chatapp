import {
  db, ref, get, push, onValue, remove,
  auth, signOut, onAuthStateChanged
} from "./firebase.js";

setupChat();

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