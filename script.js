// Save username to localStorage
localStorage.setItem("username", username);

// Load the saved username when the page loads
window.onload = function() {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
        document.getElementById("username").value = savedUsername; // ✅ Correctly setting value
    }
};

// Function to send a message
function sendMessage() {
    const usernameInput = document.getElementById("username"); 
    const messageInput = document.getElementById("message");

    const username = usernameInput.value.trim(); // ✅ Get the value
    const message = messageInput.value.trim();

    if (username && message) {
        localStorage.setItem("username", username); // ✅ Store username in localStorage

        const timestamp = new Date();
        const formattedTime = `${timestamp.getMonth() + 1}/${timestamp.getDate()} ${timestamp.getHours()}:${timestamp.getMinutes()}`;

        push(ref(window.db, 'messages'), {
            username,
            message,
            time: formattedTime
        });

        messageInput.value = ""; // Clear input
    }
}


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

// Send message function
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

// Delete message function
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
