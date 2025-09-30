// notifications/checkNotification.js
// Per-type unread counting + shared badge + one-time toast per upload

const API_BASE = "https://secure-backend-tzj9.onrender.com";

const KH_LABELS = {
  user: "ទិន្នន័យរបស់ភ្នាក់ងារឥណទាន",
  customer: "ទិន្នន័យអតិថិជន",
  turnover: "ទិន្នន័យអត្រាប្រចាំឆ្នាំ",
  nbcos: "ទិន្នន័យឥណទានសកម្ម (NBC)",
  arreas: "ទិន្នន័យឥណទានយឺតយ៉ាវប្រចាំថ្ងៃ (Arreas T24)"
};

// ===== Toast helpers (only used when the page has the elements) =====
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  if (!toast || !toastMessage) return; // page has no toast UI
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

  // Also persist that we acknowledged the latest batch
  const latestKey = `latestUploadTs_${username}`;
  const lastToastKey = `lastToastShown_${username}`;
  const latest = sessionStorage.getItem(latestKey);
  if (latest) localStorage.setItem(lastToastKey, latest);
}

function getUsername() {
  try {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
    return user.username || sessionStorage.getItem("username") || "";
  } catch {
    return sessionStorage.getItem("username") || "";
  }
}

// ===== Main checker =====
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

    // Per-type read timestamps from server
    const readTimes = Object.fromEntries(
      TYPES.map(t => [t, data[`read_${username}_${t}`] ? new Date(data[`read_${username}_${t}`]) : null])
    );

    // Compute unread types, count, and newest upload time (ISO string)
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

    // Update badge + persist count for other pages
    sessionStorage.setItem("notifUnreadCount", String(unreadCount));
    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = "inline-block";
        badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
      } else {
        badge.style.display = "none";
      }
    }

    // Save the latest upload timestamp in sessionStorage so hideToast() can ack it
    const latestKey = `latestUploadTs_${username}`;
    if (newestTs) sessionStorage.setItem(latestKey, newestTs);

    // ===== Toast logic (show once per upload batch) =====
    const lastToastKey = `lastToastShown_${username}`;
    const noShowKey = `noShowToast_${username}`;
    const noShow = localStorage.getItem(noShowKey);
    const lastToast = localStorage.getItem(lastToastKey);

    // IMPORTANT: Even if there is no toast UI on this page, we want to
    // ack the current newest batch so the toast doesn't pop up again on
    // another page upon reload. So if there's no toast UI, we
    // automatically set lastToastShown to newestTs right away.
    const hasToastUI = !!document.getElementById("toast");

    if (unreadCount > 0 && newestTs) {
      if (!hasToastUI) {
        // No toast elements on this page → mark as seen to avoid repeat toasts until next upload
        if (lastToast !== newestTs) {
          localStorage.setItem(lastToastKey, newestTs);
        }
      } else {
        // Page has toast UI; show it once per batch unless user opted out
        if (noShow !== "true" && lastToast !== newestTs) {
          const labelPreview = unreadTypes
            .slice(0, 2)
            .map(t => KH_LABELS[t] || t)
            .join(" , ");
          const extra = unreadTypes.length > 2 ? ` និង​ទៀត` : "";
          const message = `លោកគ្រូ/អ្នកគ្រូ មានការជូនដំណឹងថ្មីចំនួន ${unreadCount} សារ (${labelPreview}${extra})`;

          showToast(message);

          // Mark this batch as shown immediately so it won't appear again on reload
          localStorage.setItem(lastToastKey, newestTs);
        }
      }
    }
  } catch (err) {
    console.error("Notification fetch error:", err);
    // Keep badge steady if API fails
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

// Expose to window for pages that call it
window.checkNotification = checkNotification;
window.hideToast = hideToast;
