// Replace with your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC72WABeQ2e117WwxS7BAs_L1A2cIo0u0Y",
    authDomain: "messagingapp-9bac7.firebaseapp.com",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "messagingapp-9bac7",
    storageBucket: "messagingapp-9bac7.firebasestorage.app",
    messagingSenderId: "369463204028",
    appId: "1:369463204028:web:a932d813be7ac41f5b98b9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

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

        db.ref("messages").push({
            username,
            message,
            time: formattedTime
        });

        messageInput.value = ""; // Clear input
    }
}

// Function to update messages in real-time
db.ref("messages").on("child_added", (snapshot) => {
    const data = snapshot.val();
    const messageElement = document.createElement("p");
    messageElement.textContent = `${data.username}: "${data.message}" , ${data.time}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll
});
