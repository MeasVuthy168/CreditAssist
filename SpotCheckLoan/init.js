// ✅ SpotCheckLoan/init.js
import { setupSearch } from './searchHandler.js';
import { setupSaveAndClear } from './saveOrClear.js';
import { setupNBCOSDetail } from './nbcosHandler.js';

const token = sessionStorage.getItem("token");

if (!token) {
  alert("Session expired or unauthorized access.");
  window.location.href = "../login.html";
} else {
  setupSearch(token);
  setupSaveAndClear(token);
  setupNBCOSDetail(token);
  setupCreateSpotCheckButton();
  setupAutoLogoutEvents();
}

function setupCreateSpotCheckButton() {
  const btn = document.getElementById("createSpotCheckBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      const section = document.getElementById("creditSection1");
      section.style.display = section.style.display === "none" ? "block" : "none";
      window.scrollTo({ top: section.offsetTop - 60, behavior: "smooth" });
    });
  }

  const contBtn = document.getElementById("continueToSection2Btn");
  if (contBtn) {
    contBtn.addEventListener("click", () => {
      const section2 = document.getElementById("inspectionSection2");
      section2.style.display = "block";
      window.scrollTo({ top: section2.offsetTop - 60, behavior: "smooth" });
    });
  }
}

function setupAutoLogoutEvents() {
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
