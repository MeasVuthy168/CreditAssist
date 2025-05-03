// ✅ Toast Display Function
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  if (!toast || !toastMessage) return;

  // Reset checkbox every time toast is shown
  const checkbox = document.getElementById("toastNoShowAgain");
  if (checkbox) checkbox.checked = false;

  toastMessage.textContent = message;
  toast.style.display = "block";
}

// ✅ Hide Toast and persist preference if checkbox is checked
function hideToast() {
  const checkbox = document.getElementById("toastNoShowAgain");
  if (checkbox && checkbox.checked) {
    localStorage.setItem("noShowToast", "true");
  }
  const toast = document.getElementById("toast");
  toast.style.display = "none";
}

// ✅ Shared Notification Checker
async function checkNotification() {
  try {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
    const username = user.username || "";

    const res = await fetch("https://secure-backend-tzj9.onrender.com/api/notifications/status");
    const data = await res.json();

    const uploads = ['user', 'customer', 'turnover', 'nbcos'];
    const lastReadRaw = data[`read_${username}`];
    const lastRead = lastReadRaw ? new Date(lastReadRaw) : null;

    let newCount = 0;
    let latestUploadTime = "";

    uploads.forEach(type => {
      const dateStr = data[type];
      if (!dateStr) return;
      const uploadedAt = new Date(dateStr);
      if (!lastRead || uploadedAt > lastRead) {
        newCount++;
        if (!latestUploadTime || uploadedAt > new Date(latestUploadTime)) {
          latestUploadTime = dateStr;
        }
      }
    });

    const badge = document.getElementById("notif-badge");
    if (badge) {
      if (newCount > 0) {
        badge.textContent = newCount > 9 ? "9+" : newCount;
        badge.style.display = "inline-block";

        const lastShown = localStorage.getItem("lastToastShown");
        const noShow = localStorage.getItem("noShowToast");

        if (noShow !== "true" || lastShown !== latestUploadTime) {
          showToast(`អ្នកមានការជូនដំណឹងថ្មីចំនួន ${newCount}`);
          localStorage.setItem("lastToastShown", latestUploadTime);
          localStorage.removeItem("noShowToast"); // reset if new message
        }
      } else {
        badge.style.display = "none";
      }
    }
  } catch (err) {
    console.error("Notification fetch error:", err);
  }
}
