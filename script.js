import { db, messagesRef, ref, push, onValue, remove } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const passwordButton = document.getElementById("password-button");

    if (passwordButton) {
        passwordButton.addEventListener("click", checkPassword);
    }

    if (localStorage.getItem("passwordEntered") === "true") {
        showChatScreen();
    }
});

const correctPassword = "secret123"; 

function checkPassword() {
    const passwordInput = document.getElementById("password-input").value.trim();

    if (passwordInput === correctPassword) {
        localStorage.setItem("passwordEntered", "true");
        showChatScreen();
    } else {
        alert("Incorrect password. Try again.");
    }
}

function showChatScreen() {
    document.getElementById("password-screen").classList.add("hidden");
    document.getElementById("chat-screen").classList.remove("hidden");
}

// Send Message
window.sendMessage = function () {
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
};


// Listen for new messages
onValue(messagesRef, (snapshot) => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = ""; // Clear messages

    snapshot.forEach(childSnapshot => {
        const messageId = childSnapshot.key;
        const data = childSnapshot.val();

        // Create message element
        const messageElement = document.createElement("p");
        messageElement.textContent = `${data.username}: "${data.message}" , ${data.time}`;

        // If the user sent the message, add a delete button
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
