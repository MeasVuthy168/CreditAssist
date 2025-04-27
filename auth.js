// ✅ auth.js (Global Login + Profile + Robot Control)

// 1. Check token (protect page)
const token = sessionStorage.getItem('token');
if (!token) {
  alert('Session expired or unauthorized access.');
  window.location.href = 'login.html';
}

// 2. Auto Logout if inactive
const AUTO_LOGOUT_MINUTES = 1;
let logoutTimer;
function resetLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    sessionStorage.clear();
    alert('Session expired due to inactivity. Please log in again.');
    window.location.href = 'login.html';
  }, AUTO_LOGOUT_MINUTES * 60 * 1000);
}
window.onload = resetLogoutTimer;
document.onmousemove = resetLogoutTimer;
document.onkeydown = resetLogoutTimer;
document.onclick = resetLogoutTimer;

// 3. Load profile photo + welcome name
document.addEventListener('DOMContentLoaded', () => {
  const name = sessionStorage.getItem('fullname') || 'អ្នកប្រើ';
  const imgPath = sessionStorage.getItem('image');
  console.log('Image path from session:', imgPath);

  const profilePhoto = document.getElementById('profile-photo');
  const welcome = document.getElementById('welcome');

  if (welcome) welcome.textContent = "សួស្តី, " + name;

  if (profilePhoto) {
    let finalImage = '';

    if (!imgPath || imgPath === '' || imgPath === 'profile.jpg' || imgPath === 'profile/non-image.jpg') {
      // No image or wrong placeholder image
      finalImage = 'icons/default-profile.png';
    } else {
      // Correct user image
      finalImage = "https://secure-backend-tzj9.onrender.com/" + imgPath.replace(/^\/+/, '');
    }

    profilePhoto.src = finalImage;

    profilePhoto.onerror = function () {
      this.onerror = null; // avoid loop
      this.src = "icons/default-profile.png";
    };
  }

  loadRobotMessage();
});

// 4. Load robot assistant message
async function loadRobotMessage() {
  const robotMsgEl = document.getElementById('robotMessage');
  if (!robotMsgEl) return; // if no robot box, skip

  try {
    const res = await fetch("https://secure-backend-tzj9.onrender.com/api/robot-message", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    robotMsgEl.textContent = data.message || "មិនទាន់មានសារ។";
  } catch (error) {
    console.error('Robot message error:', error);
    robotMsgEl.textContent = "មិនអាចទាញសារបានទេ។";
  }
}
