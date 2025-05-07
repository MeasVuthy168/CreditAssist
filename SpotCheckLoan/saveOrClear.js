// saveOrClear.js

// Handle Save / Update Spot Check Entry
document.getElementById("saveBtn").addEventListener("click", () => {
  const user = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};
  const selectedNBCOS = JSON.parse(sessionStorage.getItem("selectedNBCOS")) || {};

  const payload = {
    // From NBCOS detail
    LD_CUSTOMER_ID: selectedNBCOS.LD_CUSTOMER_ID || '',
    CONTRACT_LD: selectedNBCOS.CONTRACT_LD || '',
    NAME_KHMER: selectedNBCOS.NAME_KHMER || '',
    LOAN_SIZE: selectedNBCOS.LOAN_SIZE || '',
    OS_USD: selectedNBCOS.OS_USD || '',
    RATE: selectedNBCOS.RATE || '',
    CCY: selectedNBCOS.CCY || '',
    DISBURSE: selectedNBCOS.DISBURSE || '',
    MATURITY: selectedNBCOS.MATURITY || '',
    LOAN_TERM: selectedNBCOS.LOAN_TERM || '',
    LOAN_CYCLE: selectedNBCOS.LOAN_CYCLE || '',
    CO: selectedNBCOS.CO || '',
    BranchOK: selectedNBCOS.BranchOK || '',
    ProductType: selectedNBCOS.ProductType || '',

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

  fetch("https://secure-backend-tzj9.onrender.com/api/spotcheck/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      alert("✅ Spot Check saved successfully!");
    })
    .catch(err => {
      console.error("❌ Failed to save:", err);
      alert("❌ Save failed. Please try again.");
    });
});

// Handle Clear Button
document.getElementById("clearBtn").addEventListener("click", () => {
  // Clear all inputs in Section 1 and 2
  document.querySelectorAll('#creditSection1 input, #inspectionSection2 input').forEach(input => input.value = '');
  document.querySelectorAll('#creditSection1 select, #inspectionSection2 select').forEach(select => select.selectedIndex = 0);

  alert("🧹 Cleared all fields.");
});
