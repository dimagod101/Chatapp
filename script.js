// DOM elements
const messagesDiv = document.getElementById("messages");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");

// Initialize Firebase (it's already loaded from the CDN)
const database = firebase.database();

// Function to send message
function sendMessage() {
    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();
    if (username && message) {
        const timestamp = new Date();
        const formattedTime = `${timestamp.getMonth()+1}/${timestamp.getDate()} ${timestamp.getHours()}:${timestamp.getMinutes()}`;

        // Using Firebase Realtime Database to push message data
        database.ref('messages').push({
            username,
            message,
            time: formattedTime
        });

        messageInput.value = ""; // Clear input
    }
}

// Function to update messages in real-time
database.ref('messages').on('value', (snapshot) => {
    messagesDiv.innerHTML = '';  // Clear existing messages
    snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        const messageElement = document.createElement("p");
        messageElement.textContent = `${data.username}: "${data.message}" , ${data.time}`;
        messagesDiv.appendChild(messageElement);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll
});
