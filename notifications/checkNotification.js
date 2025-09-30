// notifications/checkNotification.js
const API_BASE = "https://secure-backend-tzj9.onrender.com";

function getUsername() {
  try {
    const u = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
    return u.username || sessionStorage.getItem("username") || "";
  } catch {
    return sessionStorage.getItem("username") || "";
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  const msg = document.getElementById("toastMessage");
  if (!toast || !msg) return;
  const cb = document.getElementById("toastNoShowAgain");
  if (cb) cb.checked = false;
  msg.textContent = message;
  toast.style.display = "block";
}

function hideToast() {
  const username = getUsername();
  const cb = document.getElementById("toastNoShowAgain");
  if (cb && cb.checked && username) {
    localStorage.setItem(`noShowToast_${username}`, "true");
  }
  const toast = document.getElementById("toast");
  if (toast) toast.style.display = "none";
}

async function checkNotification() {
  try {
    const username = getUsername();
    const badge = document.getElementById("notif-badge");

    if (!username) {
      if (badge) badge.style.display = "none";
      sessionStorage.setItem("notifUnreadCount", "0");
      return;
    }

    const clearedAtStr = localStorage.getItem(`notifClearedAt_${username}`);
    const clearedAt = clearedAtStr ? new Date(clearedAtStr) : null;

    const res = await fetch(`${API_BASE}/api/notifications/status`);
    const data = await res.json();

    const TYPES = ["user", "customer", "turnover", "nbcos", "arreas"];

    // Per-type reads
    const readTimes = Object.fromEntries(
      TYPES.map(t => [t, data[`read_${username}_${t}`] ? new Date(data[`read_${username}_${t}`]) : null])
    );

    let unreadCount = 0;
    let newestTs = "";
    const unreadTypes = [];

    const KH_LABELS = {
      user: "ទិន្នន័យរបស់ភ្នាក់ងារឥណទាន",
      customer: "ទិន្នន័យអតិថិជន",
      turnover: "ទិន្នន័យអត្រាប្រចាំឆ្នាំ",
      nbcos: "ទិន្នន័យឥណទានសកម្ម (NBC)",
      arreas: "ទិន្នន័យឥណទានយឺតយ៉ាវប្រចាំថ្ងៃ (Arreas T24)"
    };

    TYPES.forEach(t => {
      const upStr = data[t];
      if (!upStr) return;
      const uploadedAt = new Date(upStr);

      // Ignore uploads older/equal to last Clear All
      if (clearedAt && uploadedAt <= clearedAt) return;

      const lastRead = readTimes[t];
      const isNew = !lastRead || uploadedAt > lastRead;
      if (isNew) {
        unreadCount++;
        unreadTypes.push(t);
        if (!newestTs || uploadedAt > new Date(newestTs)) newestTs = upStr;
      }
    });

    // Badge + persist count for other pages
    sessionStorage.setItem("notifUnreadCount", String(unreadCount));
    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = "inline-block";
        badge.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
      } else {
        badge.style.display = "none";
      }
    }

    // Optional toast if the page has it
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    if (toast && toastMessage && unreadCount > 0) {
      const noShowKey = `noShowToast_${username}`;
      const lastToastKey = `lastToastShown_${username}`;
      const noShow = localStorage.getItem(noShowKey);
      const lastToast = localStorage.getItem(lastToastKey);

      if (noShow !== "true" || lastToast !== newestTs) {
        const labelPreview = unreadTypes.slice(0, 2).map(t => KH_LABELS[t] || t).join(" , ");
        const extra = unreadTypes.length > 2 ? " និង​ទៀត" : "";
        const msg = `លោកគ្រូ/អ្នកគ្រូ មានការជូនដំណឹងថ្មីចំនួន ${unreadCount} សារ (${labelPreview}${extra})`;
        showToast(msg);
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
        badge.textContent = stored > 9 ? "9+" : String(stored);
      } else {
        badge.style.display = "none";
      }
    }
  }
}

// Export for pages
window.checkNotification = checkNotification;
window.hideToast = hideToast;
