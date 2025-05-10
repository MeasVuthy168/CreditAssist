import { setupSearch } from './searchHandler.js';
import { setupSaveAndClear } from './saveOrClear.js';
import { setupNBCOSDetail } from './nbcosHandler.js';

const token = sessionStorage.getItem("token");

if (!token) {
  alert("Session expired or unauthorized access.");
  window.location.href = "../login.html";
} else {
  window.addEventListener("DOMContentLoaded", () => {
    setupSearch(token);
    setupSaveAndClear(token);
    setupNBCOSDetail(token);
    setupAutoLogout();
  });
}

function setupAutoLogout() {
  const AUTO_LOGOUT_MINUTES = 5;
  let logoutTimer;

  function resetLogoutTimer() {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      sessionStorage.clear();
      alert("Session expired due to inactivity. Please log in again.");
      window.location.href = "../login.html";
    }, AUTO_LOGOUT_MINUTES * 60 * 1000);
  }

  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'touchmove', 'scroll'].forEach(event => {
    document.addEventListener(event, resetLogoutTimer, true);
  });

  resetLogoutTimer();
}
