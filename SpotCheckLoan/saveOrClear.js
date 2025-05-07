// === Clear all inputs in Section 1 and Section 2 ===
document.getElementById("clearBtn").addEventListener("click", () => {
  const inputs = document.querySelectorAll(
    '#creditSection1 input, #creditSection1 select, #inspectionSection2 input, #inspectionSection2 select'
  );
  inputs.forEach(el => el.value = "");
});

// === Save or Update data from both sections ===
document.getElementById("saveBtn").addEventListener("click", () => {
  const data = {
    // Section 1
    round: document.querySelector('#creditSection1 select:nth-of-type(1)').value,
    checkDate: document.querySelector('#creditSection1 input[type="date"]').value,
    repaymentStatus: document.querySelector('#creditSection1 select:nth-of-type(2)').value,
    repaymentNote: document.querySelector('#creditSection1 input[type="text"]:nth-of-type(1)').value,
    docStatus: document.querySelector('#creditSection1 select:nth-of-type(3)').value,
    docNote: document.querySelector('#creditSection1 input[type="text"]:nth-of-type(2)').value,

    // Section 2
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
    conclusion: document.querySelector('#inspectionSection2 select:nth-of-type(7)').value
  };

  // Log or POST later
  console.log("Spot Check Data:", data);
  alert("Data has been prepared for saving (backend connection coming next).");
});
