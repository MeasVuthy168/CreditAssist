<!-- Place this file at: /notifications/checkNotification.js -->
<script>
// ====== CONFIG ======
const BACKEND = "https://secure-backend-tzj9.onrender.com";
const TYPES = ['user', 'customer', 'turnover', 'nbcos', 'arreas'];

// ====== Toast helpers (same IDs you already use) ======
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  if (!toast || !toastMessage) return;
  const checkbox = document.getElementById("toastNoShowAgain");
  if (checkbox) checkbox.checked = false;
  toastMessage.textContent = message;
  toast.style.display = "block";
}

function hideToast() {
  const checkbox = document.getElementById("toastNoShowAgain");
  const user = getUser();
  const username = user.username || "";
  if (checkbox && checkbox.checked) {
    localStorage.setItem(`noShowToast_${username}`, "true");
  }
  const toast = document.getElementById("toast");
  if (toast) toast.style.display = "none";
}

// ====== Small utilities ======
function getUser() {
  // Try structured object first, then fallbacks
  try {
    const u = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
    if (u && (u.username || u.user || u.name)) return u;
  } catch {}
  return {
    username: sessionStorage.getItem("username") || "",
    fullname: sessionStorage.getItem("fullname") || "",
    position: sessionStorage.getItem("userPosition") || ""
  };
}

function maxDateStr(a, b) {
  if (!a) return b || null;
  if (!b) return a || null;
  return (new Date(a) > new Date(b)) ? a : b;
}

// ====== Main badge + optional toast updater ======
async function checkNotification() {
  try {
    const user = getUser();
    const username = user.username || "";

    // Pull server status
    const res = await fetch(`${BACKEND}/api/notifications/status`);
    const data = await res.json();

    // Per-user read map + clearedAt (cross-device)
    const readMap = data[`read_${username}`] || {};
    const clearedAt = readMap.clearedAt ? new Date(readMap.clearedAt) : null;

    // Compute unread count using per-type read and clearedAt
    let unreadCount = 0;
    let latestTrigger = null; // latest upload among unread (for toast de-dupe)

    TYPES.forEach(type => {
      const upStr = data[type];
      if (!upStr) return; // never uploaded

      const uploadedAt = new Date(upStr);
      // If cleared, skip anything older-or-equal than clearedAt
      if (clearedAt && uploadedAt <= clearedAt) return;

      const readStr = readMap[type] || null;
      const readAt = readStr ? new Date(readStr) : null;

      const isUnread = !readAt || uploadedAt > readAt;
      if (isUnread) {
        unreadCount++;
        latestTrigger = maxDateStr(latestTrigger, upStr);
      }
    });

    // Update badge (if present)
    const badge = document.getElementById("notif-badge");
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
        badge.style.display = "inline-block";
      } else {
        badge.style.display = "none";
      }
    }

    // Optional: toast (per-user preference)
    const noShow = localStorage.getItem(`noShowToast_${username}`);
    const lastToast = localStorage.getItem(`lastToastShown_${username}`);
    if (unreadCount > 0 && latestTrigger) {
      // Only show toast if the latest unread upload changed OR user didn't ask to hide
      if (noShow !== "true" || lastToast !== latestTrigger) {
        showToast(`លោកគ្រូអ្នកគ្រូមានការជូនដំណឹងថ្មីចំនួន ${unreadCount} សារ`);
        localStorage.setItem(`lastToastShown_${username}`, latestTrigger);
        // reset per new content so user can tick again
        localStorage.removeItem(`noShowToast_${username}`);
      }
    }
  } catch (err) {
    console.error("checkNotification error:", err);
  }
}

// Optionally export the helpers if some pages need them:
window.checkNotification = checkNotification;
window.hideToast = hideToast;
</script>
