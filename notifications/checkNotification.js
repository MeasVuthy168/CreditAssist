// notifications/checkNotification.js  (OLD schema: single read_<username>)
const API_BASE = "https://secure-backend-tzj9.onrender.com";

function getUsername() {
  // Prefer an explicit key; fall back to loggedInUser
  const u1 = sessionStorage.getItem("username");
  if (u1) return u1;
  try {
    const u = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
    return u.username || "";
  } catch {
    return "";
  }
}

// Optional toast helpers (no-op if page has no toast)
function showToast(message){
  const t=document.getElementById("toast"), m=document.getElementById("toastMessage");
  if(!t||!m) return; const cb=document.getElementById("toastNoShowAgain"); if(cb) cb.checked=false;
  m.textContent=message; t.style.display="block";
}
function hideToast(){
  const cb=document.getElementById("toastNoShowAgain");
  const username=getUsername();
  if(cb && cb.checked && username){ localStorage.setItem(`noShowToast_${username}`,"true"); }
  const t=document.getElementById("toast"); if(t) t.style.display="none";
}
window.hideToast = hideToast;

async function checkNotification(){
  const badge = document.getElementById("notif-badge");
  const username = getUsername();

  if (!badge) return;               // nothing to update
  if (!username) {                  // cannot compute read key
    badge.style.display = "none";
    sessionStorage.setItem("notifUnreadCount","0");
    return;
  }

  try{
    const res = await fetch(`${API_BASE}/api/notifications/status`);
    const data = await res.json();

    // Old schema: one read timestamp per user
    const lastReadRaw = data[`read_${username}`];
    const lastRead = lastReadRaw ? new Date(lastReadRaw) : null;

    // Uploaded types we care about
    const TYPES = ["user","customer","turnover","nbcos","arreas"];

    let unread = 0;
    let newestTs = "";

    for (const t of TYPES){
      const ts = data[t];
      if(!ts) continue;
      const uploadedAt = new Date(ts);
      const isNew = !lastRead || uploadedAt > lastRead;
      if (isNew) {
        unread++;
        if(!newestTs || uploadedAt > new Date(newestTs)) newestTs = ts;
      }
    }

    sessionStorage.setItem("notifUnreadCount", String(unread));
    if (unread > 0){
      badge.style.display = "inline-block";
      badge.textContent = unread > 9 ? "9+" : unread;
    } else {
      badge.style.display = "none";
    }

    // Optional toast support (only shows if the page actually has a toast)
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    if (toast && toastMessage && unread > 0){
      const noShowKey = `noShowToast_${username}`;
      const lastToastKey = `lastToastShown_${username}`;
      const noShow = localStorage.getItem(noShowKey);
      const lastToast = localStorage.getItem(lastToastKey);
      if (noShow !== "true" || lastToast !== newestTs){
        showToast(`លោកគ្រូ/អ្នកគ្រូ មានការជូនដំណឹងថ្មីចំនួន ${unread} សារ`);
        localStorage.setItem(lastToastKey, newestTs);
        localStorage.removeItem(noShowKey);
      }
    }
  }catch(e){
    console.error("Notification fetch error:", e);
    // fallback to stored count so badge doesn't flicker off
    const stored = parseInt(sessionStorage.getItem("notifUnreadCount") || "0", 10);
    if (stored > 0){
      badge.style.display = "inline-block";
      badge.textContent = stored > 9 ? "9+" : stored;
    } else {
      badge.style.display = "none";
    }
  }
}
window.checkNotification = checkNotification;
