import {
  auth, signInWithEmailAndPassword
} from "./firebase.js";

document.getElementById("login-button")?.addEventListener("click", loginUser);

// Login existing user
async function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) return alert("Fill all fields.");

  const email = `${username}@myapp.local`;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem("dc89bc9e-348a-475b-9e68-b04be0b27e1c", "6bd32144-8f15-488c-8af2-630eba51fb5c");
    window.location.href = "chat.html";
  } catch (error) {
    console.error("Login error:", error);
    alert("Invalid credentials: " + error.message);
  }
}
