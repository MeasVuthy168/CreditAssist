// notifications/checkNotification.js
// Per-type unread counting + shared badge + optional toast + broadcast to other pages

const API_BASE = "https://secure-backend-tzj9.onrender.com";

const KH_LABELS = {
  user: "ទិន្នន័យរបស់ភ្នាក់ងារឥណទាន",
  customer: "ទិន្នន័យអតិថិជន",
  turnover: "ទិន្នន័យអត្រាប្រចាំឆ្នាំ",
  nbcos: "ទិន្នន័យឥណទានសកម្ម (NBC)",
  arreas: "ទិន្នន័យឥណទានយឺតយ៉ាវប្រចាំថ្ងៃ (Arreas T24)"
};

// ===== Toast helpers (only if page has the elements) =====
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
  const username = getUsername();
  if (checkbox && checkbox.checked && username) {
    localStorage.setItem(`noShowToast_${username}`, "true");
  }
  const toast = document.getElementById("toast");
  if (toast) toast.style.display = "none";
}

function getUsername() {
  try {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
    return user.username || sessionStorage.getItem("username") || "";
  } catch {
    return sessionStorage.getItem("username") || "";
  }
}

// ===== Main checker (used by Home / Setting) =====
async function checkNotification() {
  try {
    const username = getUsername();
    const badge = document.getElementById("notif-badge");

    if (!username) {
      if (badge) badge.style.display = "none";
      sessionStorage.setItem("notifUnreadCount", "0");
      return;
    }

    const res = await fetch(`${API_BASE}/api/notifications/status`);
    const data = await res.json();

    const TYPES = ["user", "customer", "turnover", "nbcos", "arreas"];

    const readTimes = Object.fromEntries(
      TYPES.map(t => [t, data[`read_${username}_${t}`] ? new Date(data[`read_${username}_${t}`]) : null])
    );

    let unreadCount = 0;
    let newestTs = "";
    const unreadTypes = [];

    TYPES.forEach(t => {
      const uploadedStr = data[t];
      if (!uploadedStr) return;

      const uploadedAt = new Date(uploadedStr);
      const lastRead = readTimes[t];

      const isNew = !lastRead || uploadedAt > lastRead;
      if (isNew) {
        unreadCount++;
        unreadTypes.push(t);
        if (!newestTs || uploadedAt > new Date(newestTs)) newestTs = uploadedStr;
      }
    });

    // Update badge UI
    sessionStorage.setItem("notifUnreadCount", String(unreadCount));
    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = "inline-block";
        badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
      } else {
        badge.style.display = "none";
      }
    }

    // 🔔 broadcast latest count to other pages (Home, Setting, etc.)
    localStorage.setItem('notifSync', JSON.stringify({ unread: unreadCount, ts: Date.now() }));

    // ===== Optional toast
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    if (toast && toastMessage && unreadCount > 0) {
      const noShowKey = `noShowToast_${username}`;
      const lastToastKey = `lastToastShown_${username}`;
      const noShow = localStorage.getItem(noShowKey);
      const lastToast = localStorage.getItem(lastToastKey);

      if (noShow !== "true" || lastToast !== newestTs) {
        const labelPreview = unreadTypes.slice(0, 2).map(t => KH_LABELS[t] || t).join(" , ");
        const extra = unreadTypes.length > 2 ? ` និង​ទៀត` : "";
        const message = `លោកគ្រូ/អ្នកគ្រូ មានការជូនដំណឹងថ្មីចំនួន ${unreadCount} សារ (${labelPreview}${extra})`;

        showToast(message);
        localStorage.setItem(lastToastKey, newestTs);
        localStorage.removeItem(noShowKey);
      }
    }
  } catch (err) {
    console.error("Notification fetch error:", err);
    const badge = document.getElementById("notif-badge");
    if (badge) {
      const stored = parseInt(sessionStorage.getItem("notifUnreadCount") || "0", 10);
      if (stored > 0) {
        badge.style.display = "inline-block";
        badge.textContent = stored > 9 ? "9+" : stored;
      } else {
        badge.style.display = "none";
      }
    }
  }
}

// Listen for broadcasts from Notifications page (and other tabs)
window.addEventListener('storage', (e) => {
  if (e.key !== 'notifSync') return;
  try {
    const { unread } = JSON.parse(e.newValue || "{}");
    const badge = document.getElementById('notif-badge');
    sessionStorage.setItem("notifUnreadCount", String(unread || 0));
    if (badge) {
      if (unread > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = unread > 9 ? '9+' : unread;
      } else {
        badge.style.display = 'none';
      }
    }
  } catch {}
});

// Expose helpers
window.hideToast = hideToast;
window.checkNotification = checkNotification;
