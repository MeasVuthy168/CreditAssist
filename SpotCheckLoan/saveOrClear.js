// saveOrClear.js

document.addEventListener("DOMContentLoaded", () => {
  // Handle Save Button
  document.getElementById("saveBtn").addEventListener("click", async () => {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};
    const token = sessionStorage.getItem("token");

    // Extract from the first row of the displayed NBCOS table
    const row = document.querySelector(".nbcos-table tbody tr");
    if (!row) {
      alert("⚠️ Please load NBCOS data first.");
      return;
    }

    const cells = row.querySelectorAll("td");
    const payload = {
      // From NBCOS detail (matching column order)
      LD_CUSTOMER_ID: cells[0]?.innerText.trim() || '',
      CONTRACT_LD: cells[1]?.innerText.trim() || '',
      NAME_KHMER: cells[2]?.innerText.trim() || '',
      LOAN_SIZE: cells[3]?.innerText.trim() || '',
      OS_USD: cells[4]?.innerText.trim() || '',
      RATE: cells[5]?.innerText.trim() || '',
      CCY: cells[6]?.innerText.trim() || '',
      DISBURSE: cells[7]?.innerText.trim() || '',
      MATURITY: cells[8]?.innerText.trim() || '',
      LOAN_TERM: cells[9]?.innerText.trim() || '',
      LOAN_CYCLE: cells[10]?.innerText.trim() || '',
      CO: cells[11]?.innerText.trim() || '',
      "Branch-OK": cells[12]?.innerText.trim() || '',
      "Product Type": cells[13]?.innerText.trim() || '',

      // From Section 1
      cycle: document.querySelector('#creditSection1 select:nth-of-type(1)').value,
      checkDate: document.querySelector('#creditSection1 input[type="date"]').value,
      repaymentStatus: document.querySelector('#creditSection1 select:nth-of-type(2)').value,
      repaymentNote: document.querySelector('#creditSection1 input[type="text"]:nth-of-type(1)').value,
      docStatus: document.querySelector('#creditSection1 select:nth-of-type(3)').value,
      docNote: document.querySelector('#creditSection1 input[type="text"]:nth-of-type(2)').value,

      // From Section 2
      businessOld: document.querySelector('#inspectionSection2 input:nth-of-type(1)').value,
      businessNow: document.querySelector('#inspectionSection2 input:nth-of-type(2)').value,
      businessStatus: document.querySelector('#inspectionSection2 select:nth-of-type(1)').value,
      businessNote: document.querySelector('#inspectionSection2 input:nth-of-type(3)').value,
      collateralType: document.querySelector('#inspectionSection2 select:nth-of-type(2)').value,
      collateralStatus: document.querySelector('#inspectionSection2 select:nth-of-type(3)').value,
      collateralValue: document.querySelector('#inspectionSection2 select:nth-of-type(4)').value,
      collateralNote: document.querySelector('#inspectionSection2 input:nth-of-type(4)').value,
      usagePurpose: document.querySelector('#inspectionSection2 select:nth-of-type(5)').value,
      usageNote: document.querySelector('#inspectionSection2 input:nth-of-type(5)').value,
      repaymentSource: document.querySelector('#inspectionSection2 select:nth-of-type(6)').value,
      sourceNote: document.querySelector('#inspectionSection2 input:nth-of-type(6)').value,
      conclusion: document.querySelector('#inspectionSection2 select:nth-of-type(7)').value,

      // Who saved
      savedBy: user.fullname || user.username || 'Unknown'
    };

    // Submit to backend
    try {
      const res = await fetch("https://secure-backend-tzj9.onrender.com/api/spotcheck/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Spot Check saved successfully!");
        document.getElementById("creditSection1").style.display = "none";
        document.getElementById("inspectionSection2").style.display = "none";
      } else {
        alert("❌ Save failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Save error:", err);
      alert("❌ Save request failed.");
    }
  });

  // Handle Clear Button
  document.getElementById("clearBtn").addEventListener("click", () => {
    // Clear all inputs and selects
    document.querySelectorAll('#creditSection1 input, #inspectionSection2 input').forEach(i => i.value = '');
    document.querySelectorAll('#creditSection1 select, #inspectionSection2 select').forEach(s => s.selectedIndex = 0);
    alert("🧹 Cleared all fields.");
  });
});
