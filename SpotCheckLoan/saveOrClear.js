
export function validateFields(requiredIds) {
  let isValid = true;
  let firstInvalid = null;

  requiredIds.forEach(id => {
    const field = document.getElementById(id);
    if (field && !field.value.trim()) {
      field.style.border = "2px solid red";
      if (!firstInvalid) firstInvalid = field;
      isValid = false;
    } else if (field) {
      field.style.border = "";
    }
  });

  if (!isValid && firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    firstInvalid.focus();
    alert("សូមបំពេញទិន្នន័យដែលត្រូវបញ្ចូល");
  }

  return isValid;
}

export function resetForm() {
  document.querySelectorAll('#creditSection1 input, #inspectionSection2 input').forEach(i => {
    i.value = '';
    i.style.border = '';
  });
  document.querySelectorAll('#creditSection1 select, #inspectionSection2 select').forEach(s => {
    s.selectedIndex = 0;
    s.style.border = '';
  });
}

export function handleSave(selectedNBCOS, user, token, requiredIds) {
  if (!selectedNBCOS || !selectedNBCOS.LD_CUSTOMER_ID) {
    alert("❌ Please select a customer before saving.");
    return;
  }

  if (!validateFields(requiredIds)) return;

  const payload = {
    // === All selectedNBCOS fields ===
    LD_CUSTOMER_ID: selectedNBCOS.LD_CUSTOMER_ID || '',
    CONTRACT_LD: selectedNBCOS.CONTRACT_LD || '',
    NAME_KHMER: selectedNBCOS.NAME_KHMER || '',
    NAME_ENG: selectedNBCOS.NAME_ENG || '',
    TITLE: selectedNBCOS.TITLE || '',
    LOAN_SIZE: selectedNBCOS.LOAN_SIZE || '',
    LOAN_SIZE_USD: selectedNBCOS.LOAN_SIZE_USD || '',
    AGGREGATE_LOAN_SIZE: selectedNBCOS.AGGREGATE_LOAN_SIZE || '',
    OUTSTANDING: selectedNBCOS.OUTSTANDING || '',
    OS_USD: selectedNBCOS.OS_USD || '',
    OS_INT: selectedNBCOS.OS_INT || '',
    RATE: selectedNBCOS.RATE || '',
    CCY: selectedNBCOS.CCY || '',
    DISBURSE: selectedNBCOS.DISBURSE || '',
    MATURITY: selectedNBCOS.MATURITY || '',
    LOAN_TERM: selectedNBCOS.LOAN_TERM || '',
    LOAN_CYCLE: selectedNBCOS.LOAN_CYCLE || '',
    CO: selectedNBCOS.CO || '',
    LEGAL_NO: selectedNBCOS.LEGAL_NO || '',
    LEGAL_TYPE: selectedNBCOS.LEGAL_TYPE || '',
    BIRTH_DATE: selectedNBCOS.BIRTH_DATE || '',
    CO_BORROWER: selectedNBCOS.CO_BORROWER || '',
    GUARANTOR: selectedNBCOS.GUARANTOR || '',
    LOAN_REFERENCE: selectedNBCOS.LOAN_REFERENCE || '',
    PROFESSION: selectedNBCOS.PROFESSION || '',
    NOTE: selectedNBCOS.NOTE || '',
    "Restructure Covid Date": selectedNBCOS["Restructure Covid Date"] || '',
    MEMBER_REF_CBC: selectedNBCOS.MEMBER_REF_CBC || '',
    BranchOK: selectedNBCOS["Branch-OK"] || '',
    "Branch-OK": selectedNBCOS["Branch-OK"] || '',
    "Credit Officer": selectedNBCOS["Credit Officer"] || '',
    "Product Type": selectedNBCOS["Product Type"] || '',
    ABCM: selectedNBCOS.ABCM || '',
    "OS by Amount": selectedNBCOS["OS by Amount"] || '',
    "GovEmplyee/FactWorker": selectedNBCOS["GovEmplyee/FactWorker"] || '',
    Address: selectedNBCOS.Address || '',
    UniqueCIF: selectedNBCOS.UniqueCIF || '',
    UniqueCIF_Branch: selectedNBCOS.UniqueCIF_Branch || '',
    UniqueCIF_CO: selectedNBCOS.UniqueCIF_CO || '',
    Amount_Paid_Old: selectedNBCOS.Amount_Paid_Old || '',

    // === Section 1 fields ===
    cycle: document.getElementById("cycle").value,
    checkDate: document.getElementById("checkDate").value,
    repaymentStatus: document.getElementById("repaymentStatus").value,
    repaymentNote: document.getElementById("repaymentNote").value,
    docStatus: document.getElementById("docStatus").value,
    docNote: document.getElementById("docNote").value,

    // === Section 2 fields ===
    businessOld: document.getElementById("businessOld").value,
    businessNow: document.getElementById("businessNow").value,
    businessStatus: document.getElementById("businessStatus").value,
    businessNote: document.getElementById("businessNote").value,
    collateralType: document.getElementById("collateralType").value,
    collateralStatus: document.getElementById("collateralStatus").value,
    collateralValue: document.getElementById("collateralValue").value,
    collateralNote: document.getElementById("collateralNote").value,
    usagePurpose: document.getElementById("usagePurpose").value,
    usageNote: document.getElementById("usageNote").value,
    repaymentSource: document.getElementById("repaymentSource").value,
    sourceNote: document.getElementById("sourceNote").value,
    conclusion: document.getElementById("conclusion").value,

    savedBy: user.username || "Unknown"
  };

  document.getElementById("loadingOverlay").style.display = "flex";

  fetch("https://secure-backend-tzj9.onrender.com/api/spotcheck", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(() => {
      alert("✅ Spot Check saved successfully!");
      resetForm();
    })
    .catch(err => {
      console.error("❌ Save error:", err);
      alert("❌ Save failed. See console.");
    })
    .finally(() => {
      document.getElementById("loadingOverlay").style.display = "none";
    });
}
