const correctPassword = "Appicalat7&"; // Change this to your actual password

document.addEventListener("DOMContentLoaded", () => {
    const passwordButton = document.getElementById("password-button");

    if (passwordButton) {
        passwordButton.addEventListener("click", checkPassword);
    }

    // Check if user is already authenticated
    if (localStorage.getItem("passwordEntered") === "true") {
        showChatScreen();
    }
});

// Function to check password
function checkPassword() {
    const password = document.getElementById("password-input").value.trim();

    if (password === correctPassword) {
        localStorage.setItem("passwordEntered", "true");
        showChatScreen();
    } else {
        alert("Incorrect password. Try again.");
    }
}

// Function to show chat screen
function showChatScreen() {
    document.getElementById("password-screen").classList.add("hidden");
    document.getElementById("chat-screen").classList.remove("hidden");
}

// Make functions global
window.checkPassword = checkPassword;
window.showChatScreen = showChatScreen;

// Load saved username when page loads
window.onload = function() {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
        document.getElementById("username").value = savedUsername;
    }
};

// Save username whenever user changes it
document.getElementById("username").addEventListener("input", function() {
    localStorage.setItem("username", this.value);
});

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC72WABeQ2e117WwxS7BAs_L1A2cIo0u0Y",
    authDomain: "messagingapp-9bac7.firebaseapp.com",
    databaseURL: "https://messagingapp-9bac7-default-rtdb.firebaseio.com/",
    projectId: "messagingapp-9bac7",
    storageBucket: "messagingapp-9bac7.appspot.com",
    messagingSenderId: "369463204028",
    appId: "1:369463204028:web:a932d813be7ac41f5b98b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

// Function to send a message
function sendMessage() {
    const username = document.getElementById("username").value.trim();
    const message = document.getElementById("message").value.trim();
    if (username && message) {
        push(messagesRef, { 
            username, 
            message, 
            time: new Date().toLocaleString() 
        });
        document.getElementById("message").value = ""; // Clear input
    }
}

// Function to delete a message
function deleteMessage(messageId) {
    const messageRef = ref(db, `messages/${messageId}`);
    if (confirm("Are you sure you want to delete this message?")) {
        remove(messageRef)
            .then(() => console.log("Message deleted successfully"))
            .catch(error => console.error("Error deleting message:", error));
    }
}

// Listen for new messages
onValue(messagesRef, (snapshot) => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = ""; // Clear old messages

    snapshot.forEach(childSnapshot => {
        const messageId = childSnapshot.key;
        const data = childSnapshot.val();
        
        // Create message element
        const messageElement = document.createElement("p");
        messageElement.textContent = `${data.username}: "${data.message}" , ${data.time}`;

        // Add delete button if the user sent the message
        if (data.username === document.getElementById("username").value.trim()) {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "❌";
            deleteButton.style.marginLeft = "10px";
            deleteButton.onclick = () => deleteMessage(messageId);
            messageElement.appendChild(deleteButton);
        }

        messagesDiv.appendChild(messageElement);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll
});

// Make functions global
window.sendMessage = sendMessage;
window.deleteMessage = deleteMessage;
