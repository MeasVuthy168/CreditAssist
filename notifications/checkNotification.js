// notifications/checkNotification.js
// Per-type unread counting + shared badge + optional toast

const API_BASE = "https://secure-backend-tzj9.onrender.com";

// Khmer labels for nicer toast messages (optional)
const KH_LABELS = {
  user: "ទិន្នន័យរបស់ភ្នាក់ងារឥណទាន",
  customer: "ទិន្នន័យអតិថិជន",
  turnover: "ទិន្នន័យអត្រាប្រចាំឆ្នាំ",
  nbcos: "ទិន្នន័យឥណទានសកម្ម (NBC)",
  arreas: "ទិន្នន័យឥណទានយឺតយ៉ាវប្រចាំថ្ងៃ (Arreas T24)"
};

// ===== Toast helpers (use only if the page has #toast and #toastMessage) =====
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  if (!toast || !toastMessage) return; // page has no toast

  const checkbox = document.getElementById("toastNoShowAgain");
  if (checkbox) checkbox.checked = false;

  toastMessage.textContent = message;
  toast.style.display = "block";
}

function hideToast() {
  const checkbox = document.getElementById("toastNoShowAgain");
  // persist per-user "no-show" preference
  const username = getUsername();
  if (checkbox && checkbox.checked && username) {
    localStorage.setItem(`noShowToast_${username}`, "true");
  }
  const toast = document.getElementById("toast");
  if (toast) toast.style.display = "none";
}

// ===== Small helper =====
function getUsername() {
  try {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
    return user.username || sessionStorage.getItem("username") || "";
  } catch {
    return sessionStorage.getItem("username") || "";
  }
}

// ===== Main checker (call this on pages that show the badge) =====
async function checkNotification() {
  try {
    const username = getUsername();
    const badge = document.getElementById("notif-badge");

    // If no username, hide badge & bail out
    if (!username) {
      if (badge) badge.style.display = "none";
      sessionStorage.setItem("notifUnreadCount", "0");
      return;
    }

    // Load server status (timestamps for uploads + per-type reads)
    const res = await fetch(`${API_BASE}/api/notifications/status`);
    const data = await res.json();

    // Consider these types
    const TYPES = ["user", "customer", "turnover", "nbcos", "arreas"];

    // Build per-type read map like read_<username>_<type>
    const readTimes = Object.fromEntries(
      TYPES.map(t => [t, data[`read_${username}_${t}`] ? new Date(data[`read_${username}_${t}`]) : null])
    );

    // Count unread types and track latest for toast de-dup
    let unreadCount = 0;
    let newestTs = "";
    const unreadTypes = [];

    TYPES.forEach(t => {
      const uploadedStr = data[t];
      if (!uploadedStr) return; // nothing uploaded yet

      const uploadedAt = new Date(uploadedStr);
      const lastRead = readTimes[t];

      const isNew = !lastRead || uploadedAt > lastRead;
      if (isNew) {
        unreadCount++;
        unreadTypes.push(t);
        if (!newestTs || uploadedAt > new Date(newestTs)) newestTs = uploadedStr;
      }
    });

    // Update badge UI + persist count for other tabs/pages
    sessionStorage.setItem("notifUnreadCount", String(unreadCount));
    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = "inline-block";
        badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
      } else {
        badge.style.display = "none";
      }
    }

    // ===== Toast logic (optional; only if the page has toast elements) =====
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    if (toast && toastMessage && unreadCount > 0) {
      const noShowKey = `noShowToast_${username}`;
      const lastToastKey = `lastToastShown_${username}`;
      const noShow = localStorage.getItem(noShowKey);
      const lastToast = localStorage.getItem(lastToastKey);

      // Only show if user didn't opt-out OR there's a new upload after the last toast
      if (noShow !== "true" || lastToast !== newestTs) {
        // Optional: include short list of unread types in Khmer
        const labelPreview = unreadTypes
          .slice(0, 2) // show at most 2 labels to keep it short
          .map(t => KH_LABELS[t] || t)
          .join(" , ");

        const extra = unreadTypes.length > 2 ? ` និង​ទៀត` : "";
        const message = `លោកគ្រូ/អ្នកគ្រូ មានការជូនដំណឹងថ្មីចំនួន ${unreadCount} សារ (${labelPreview}${extra})`;

        showToast(message);
        localStorage.setItem(lastToastKey, newestTs);
        // reset "noShow" if there is a new message (so users see it again)
        localStorage.removeItem(noShowKey);
      }
    }
  } catch (err) {
    console.error("Notification fetch error:", err);
    // Fallback to stored count so the badge doesn't flicker off on errors
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

// Expose hideToast globally if your close button uses it
window.hideToast = hideToast;
// Expose checkNotification for pages that call it manually
window.checkNotification = checkNotification;
