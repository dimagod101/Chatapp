import { db, messagesRef, ref, push, onValue, remove, auth } from "./firebase.js";
import { get, set, child } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Constants
const correctPassword = "Appicalat7&";

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    const passwordButton = document.getElementById("password-button");
    if (passwordButton) {
        passwordButton.addEventListener("click", checkPassword);
    }

    if (localStorage.getItem("passwordEntered") === "true") {
        showChatScreen();
    }
});

// Password check
function checkPassword() {
    const input = document.getElementById("password-input").value.trim();
    if (input === correctPassword) {
        localStorage.setItem("passwordEntered", "true");
        showChatScreen();
    } else {
        alert("Incorrect password.");
    }
}

// Show chat
function showChatScreen() {
    document.getElementById("password-screen").classList.add("hidden");
    document.getElementById("chat-screen").classList.remove("hidden");
}

// Username uniqueness check
async function isUsernameTaken(username) {
    const snapshot = await get(ref(db, "users"));
    if (snapshot.exists()) {
        for (const uid in snapshot.val()) {
            if (snapshot.val()[uid].username === username) {
                return true;
            }
        }
    }
    return false;
}

// Save user if new
async function saveUsernameIfNew(uid, username) {
    const userRef = ref(db, `users/${uid}`);
    const snap = await get(userRef);
    if (!snap.exists()) {
        if (await isUsernameTaken(username)) {
            throw new Error("Username already taken");
        }
        await set(userRef, { username });
    }
}

// Get username by UID
async function getUsernameByUid(uid) {
    const snap = await get(ref(db, `users/${uid}`));
    return snap.exists() ? snap.val().username : "Unknown";
}

// Send message
window.sendMessage = async function () {
    const username = document.getElementById("username").value.trim();
    const message = document.getElementById("message").value.trim();
    const user = auth.currentUser;

    if (!user) {
        alert("Not authenticated.");
        return;
    }

    try {
        await saveUsernameIfNew(user.uid, username);

        if (message) {
            await push(messagesRef, {
                uid: user.uid,
                message,
                time: new Date().toLocaleString()
            });
            document.getElementById("message").value = "";
        }
    } catch (err) {
        alert(err.message);
    }
};

// Delete message
window.deleteMessage = function (messageId) {
    const user = auth.currentUser;
    const messageRef = ref(db, `messages/${messageId}`);

    if (!user) {
        alert("Not authenticated.");
        return;
    }

    get(messageRef).then(snapshot => {
        if (!snapshot.exists()) return alert("Message not found.");
        const data = snapshot.val();

        if (data.uid !== user.uid) {
            return alert("You can only delete your own messages.");
        }

        if (confirm("Are you sure you want to delete this message?")) {
            remove(messageRef).then(() =>
                console.log("Message deleted.")
            ).catch(err =>
                console.error("Delete error:", err)
            );
        }
    });
};

// Listen and render messages
onValue(messagesRef, async (snapshot) => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    const user = auth.currentUser;
    const userCache = {};

    const messages = snapshot.val();
    if (!messages) return;

    // Loop through messages
    for (const messageId in messages) {
        const data = messages[messageId];
        const uid = data.uid;

        // Get username from cache or DB
        let username = userCache[uid];
        if (!username) {
            username = await getUsernameByUid(uid);
            userCache[uid] = username;
        }

        // Create message element
        const msg = document.createElement("p");
        msg.textContent = `${username}: "${data.message}" , ${data.time}`;

        if (user && uid === user.uid) {
            const delBtn = document.createElement("button");
            delBtn.textContent = "❌";
            delBtn.style.marginLeft = "10px";
            delBtn.onclick = () => deleteMessage(messageId);
            msg.appendChild(delBtn);
        }

        messagesDiv.appendChild(msg);
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});