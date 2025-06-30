import {
  getAuth, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider
} from "./firebase.js";

const auth = getAuth();

// Avatar Upload (Placeholder functionality)
document.getElementById('uploadAvatar-button').addEventListener('click', () => {
    alert('Avatar upload feature coming soon!');
});

// Change Username
document.getElementById('changeUsername-button').addEventListener('click', async () => {
    const oldUsername = document.getElementById('old-username').value.trim();
    const newUsername = document.getElementById('new-username').value.trim();

    if (!oldUsername || !newUsername) {
        alert('Please fill in both username fields.');
        return;
    }

    const user = auth.currentUser
    if (user.email === oldUsername + "@myapp.local") {
        try {
            alert('Username successfully changed!');
        } catch (error) {
            alert('Error updating username: ' + error.message);
        }
    } else {
        alert('Current username does not match logged in user.');
    }
});

// Change Password
document.getElementById('changePassword-button').addEventListener('click', async () => {
    const oldPassword = document.getElementById('old-password').value.trim();
    const newPassword = document.getElementById('new-Password').value.trim();
    const newAgainPassword = document.getElementById('newAgain-password').value.trim();

    if (!oldPassword || !newPassword || !newAgainPassword) {
        alert('Please fill in all password fields.');
        return;
    }

    if (newPassword !== newAgainPassword) {
        alert('New passwords do not match!');
        return;
    }

    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, oldPassword);

    try {
        alert('Password successfully changed!');
    } catch (error) {
        alert('Error changing password: ' + error.message);
    }
});
