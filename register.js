import {
  db, ref, set, auth, createUserWithEmailAndPassword
} from "./firebase.js";

const getSHA256Hash = async (input) => {
  const buffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};
const MASTER_PASSWORD = "0d21c911528176264c20174a7f5eeedbd35990f9e57f7fdbee1422ad396917fb";

document.getElementById("register-button")?.addEventListener("click", registerUser);

// Register new user
async function registerUser() {
  const master = document.getElementById("master-password").value.trim();
  const username = document.getElementById("register-username").value.trim();
  const password = document.getElementById("register-password").value;

  if (!master || !username || !password) return alert("Fill all fields.");
  if (await getSHA256Hash(master) !== MASTER_PASSWORD) return alert("Incorrect master password.");

  const email = `${username}@myapp.local`;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Store only the username in the DB, NOT the password
    await set(ref(db, `users/${uid}`), { username });

    window.location.href = "index.html";
  } catch (error) {
    console.error("Register error:", error);
    alert("Registration failed: " + error.message);
  }
}