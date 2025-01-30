// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC72WABeQ2e117WwxS7BAs_L1A2cIo0u0Y", 
    authDomain: "messagingapp-9bac7.firebaseapp.com", 
    databaseURL: "https://messagingapp-9bac7-default-rtdb.firebaseio.com/", // <-- Use your actual database URL 
    projectId: "messagingapp-9bac7", 
    storageBucket: "messagingapp-9bac7.firebasestorage.app", 
    messagingSenderId: "369463204028", 
    appId: "1:369463204028:web:a932d813be7ac41f5b98b9" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const messagesDiv = document.getElementById("messages");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");

// Function to send a message
function sendMessage() {
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();
    if (username && message) {
        const timestamp = new Date();
        const formattedTime = `${timestamp.getMonth() + 1}/${timestamp.getDate()} ${timestamp.getHours()}:${timestamp.getMinutes()}`;

        // Push message to Firebase with a unique key
        push(ref(db, 'messages'), {
            username,
            message,
            time: formattedTime
        });

        messageInput.value = ""; // Clear input
    }
}

// Function to delete a message (Fixed)
function deleteMessage(messageId) {
    const messageRef = ref(db, `messages/${messageId}`); // Use `db`, not `window.db`
    if (confirm("Are you sure you want to delete this message?")) {
        remove(messageRef)
            .then(() => console.log("Message deleted successfully"))
            .catch(error => console.error("Error deleting message:", error));
    }
}

// Function to update messages in real-time
onValue(ref(db, 'messages'), (snapshot) => {
    messagesDiv.innerHTML = '';  
    snapshot.forEach(childSnapshot => {
        const messageId = childSnapshot.key;
        const data = childSnapshot.val();
        
        const messageElement = document.createElement("p");
        messageElement.innerHTML = `${data.username}: "${data.message}" , ${data.time} `;

        if (data.username === usernameInput.value.trim()) {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "❌";
            deleteButton.style.marginLeft = "10px";
            deleteButton.onclick = () => deleteMessage(messageId);
            messageElement.appendChild(deleteButton);
        }

        messagesDiv.appendChild(messageElement);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
