
// nbcosHandler.js

export function setupNBCOSDetail(token) {
  const tableBody = document.querySelector("#results tbody");
  const detailPanel = document.getElementById("nbcosDetail");
  const content = document.getElementById("nbcosContent");

  function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return isNaN(date) ? '' : date.toLocaleDateString('en-GB');
  }

  function formatNumber(value) {
    return (!value || isNaN(value)) ? '' : Number(value).toLocaleString('en-US');
  }

  tableBody.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    if (!row || !row.cells[0]) return;

    const cif = row.cells[0].textContent.trim();
    if (!cif) return;

    // Highlight clicked row
    document.querySelectorAll("#results tbody tr").forEach(r => {
      if (r !== row) r.style.display = "none";
      else r.classList.add("highlighted-row");
    });

    detailPanel.style.display = "block";
    content.innerHTML = "<div class='spinner'></div> <span>កំពុងទាញយកទិន្នន័យ...</span>";

    fetch(`https://secure-backend-tzj9.onrender.com/api/nbcos/by-cif?cif=${encodeURIComponent(cif)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data || data.length === 0) {
          content.innerHTML = "គ្មានទិន្នន័យឥណទានសម្រាប់អតិថិជននេះទេ។";
          return;
        }

        sessionStorage.setItem("selectedNBCOS", JSON.stringify(data[0]));
        console.log("✅ Selected NBCOS saved to sessionStorage:", data[0]);

        const headers = [
          "LD_CUSTOMER_ID", "CONTRACT_LD", "NAME_KHMER", "LOAN_SIZE",
          "OS_USD", "RATE", "CCY", "DISBURSE", "MATURITY",
          "LOAN_TERM", "LOAN_CYCLE", "CO", "Branch-OK", "Product Type"
        ];

        let totalOS = 0;
        let tableHTML = `<div class="nbcos-wrapper">
        <table class="nbcos-table">
         <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
         <tbody>`;

        data.forEach(item => {
          tableHTML += `<tr>${headers.map(key => {
            let value = item[key] || '';

            if (["DISBURSE", "MATURITY", "BIRTH_DATE"].includes(key)) {
              value = formatDate(value);
            }

            if (["OS_USD"].includes(key)) {
              const num = parseFloat(item[key]) || 0;
              totalOS += num;
              value = formatNumber(num);
            } else if (["LOAN_SIZE", "LOAN_SIZE_USD", "AGGREGATE_LOAN_SIZE", "OUTSTANDING", "OS_INT", "OS by Amount", "Amount_Paid_Old"].includes(key)) {
              value = formatNumber(value);
            }

            return `<td>${value}</td>`;
          }).join('')}</tr>`;
        });

        tableHTML += `</tbody></table></div>`;
        content.innerHTML = tableHTML;

        // Fetch latest DISBURSE date
        fetch("https://secure-backend-tzj9.onrender.com/api/nbcos/latest-disburse", {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(result => {
            const latestDisburse = result.latestDisburse ? new Date(result.latestDisburse) : null;
            content.innerHTML += `
              <div class="nbcos-summary">
                <div><strong>✨សរុបឥណទាន (OS_USD):</strong> ${formatNumber(totalOS)}</div>
                <div><strong>✨ទិន្នន័យ NBC_OS គិតត្រឹម:</strong> ${latestDisburse ? formatDate(latestDisburse.toISOString()) : '-'}</div>
              </div>`;
          })
          .catch(() => {
            content.innerHTML += `
              <div class="nbcos-summary">
                <div><strong>✨សរុបឥណទាន (OS_USD):</strong> ${formatNumber(totalOS)}</div>
                <div><strong>✨ទិន្នន័យ NBC_OS គិតត្រឹម:</strong> -</div>
              </div>`;
          });
      })
      .catch(err => {
        console.error("NBCOS fetch error:", err);
        content.innerHTML = "បរាជ័យក្នុងការទាញ NBCOS";
      });
  });

  // Close button logic
  document.getElementById("closeDetailBtn").addEventListener("click", () => {
    detailPanel.style.display = "none";
    document.querySelectorAll("#results tbody tr").forEach(row => {
      row.style.display = "";
      row.classList.remove("highlighted-row");
    });
  });
}
