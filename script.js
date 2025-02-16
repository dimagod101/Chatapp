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
