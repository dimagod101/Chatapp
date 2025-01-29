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
        const messageRef = push(ref(window.db, 'messages'), {
            username,
            message,
            time: formattedTime
        });

        messageInput.value = ""; // Clear input
    }
}

// Function to delete a message
function deleteMessage(messageId) {
    const messageRef = ref(window.db, `messages/${messageId}`);
    if (confirm("Are you sure you want to delete this message?")) {
        window.remove(messageRef); // Remove from Firebase
    }
}

// Function to update messages in real-time
onValue(ref(window.db, 'messages'), (snapshot) => {
    messagesDiv.innerHTML = '';  // Clear existing messages
    snapshot.forEach(childSnapshot => {
        const messageId = childSnapshot.key; // Firebase message ID
        const data = childSnapshot.val();
        
        // Create message element
        const messageElement = document.createElement("p");
        messageElement.innerHTML = `${data.username}: "${data.message}" , ${data.time} `;

        // Add delete button only for the user who sent the message
        if (data.username === usernameInput.value.trim()) {
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
