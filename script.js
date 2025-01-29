import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const messagesDiv = document.getElementById("messages");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");

// Function to send message
function sendMessage() {
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();
    if (username && message) {
        const timestamp = new Date();
        const formattedTime = `${timestamp.getMonth()+1}/${timestamp.getDate()} ${timestamp.getHours()}:${timestamp.getMinutes()}`;

        push(ref(db, "messages"), {
            username,
            message,
            time: formattedTime
        });

        messageInput.value = ""; // Clear input
    }
}

// Function to update messages in real-time
onValue(ref(db, "messages"), (snapshot) => {
    messagesDiv.innerHTML = '';  // Clear existing messages
    snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        const messageElement = document.createElement("p");
        messageElement.textContent = `${data.username}: "${data.message}" , ${data.time}`;
        messagesDiv.appendChild(messageElement);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll
});
