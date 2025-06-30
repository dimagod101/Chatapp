import {
  db, auth, ref, get, onValue, EmailAuthProvider, child, push, update, reauthenticateWithCredential, updatePassword
} from "./firebase.js";

// Change Username
document.getElementById('changeUsername-button').addEventListener('click', async () => {
    const oldUsername = document.getElementById('old-username').value.trim();
    const newUsername = document.getElementById('new-username').value.trim();
    if (!oldUsername || !newUsername) {
        alert('Please fill in all fields.');
        return;
    }

    const user = auth.currentUser;
    const userRef = (await get(ref(db, `users/${user.uid}/username`))).val();
    if (userRef === oldUsername) {
        try {
            await update(ref(db, `users/${user.uid}`), { username: newUsername });
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
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        alert('Password successfully changed!');
    } catch (error) {
        alert('Error changing password: ' + error.message);
    }
});