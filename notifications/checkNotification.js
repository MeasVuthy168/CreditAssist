
// ✅ Toast Display Function
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.style.display = "block";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.style.display = "none";
    }, 500);
  }, duration);
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

    uploads.forEach(type => {
      const dateStr = data[type];
      if (!dateStr) return;
      const uploadedAt = new Date(dateStr);
      if (!lastRead || uploadedAt > lastRead) {
        newCount++;
      }
    });

    const badge = document.getElementById("notif-badge");
    if (badge) {
      if (newCount > 0) {
        badge.textContent = newCount > 9 ? "9+" : newCount;
        badge.style.display = "inline-block";

        // ✅ Show toast if new notifications exist
        showToast(`អ្នកមានការជូនដំណឹងថ្មីចំនួន ${newCount}`, 4000);
      } else {
        badge.style.display = "none";
      }
    }
  } catch (err) {
    console.error("Notification fetch error:", err);
  }
}
