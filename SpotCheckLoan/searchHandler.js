// searchHandler.js
export function setupSearch(token) {
  const searchBox = document.getElementById("searchBox");
  const searchButton = document.getElementById("searchButton");
  const resultLabel = document.getElementById("resultLabel");
  const tableHead = document.querySelector("#results thead");
  const resultsTable = document.querySelector("#results tbody");
  const nbcosDetail = document.getElementById("nbcosDetail");
  const tapHint = document.getElementById("tapHint");
  const dataSourceLabel = document.getElementById("dataSourceLabel");

  function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return isNaN(date) ? '' : date.toLocaleDateString('en-GB');
  }

  function formatNumber(value) {
    return (!value || isNaN(value)) ? '' : Number(value).toLocaleString('en-US');
  }

  function showTapHint() {
    tapHint.style.display = "flex";
    setTimeout(() => tapHint.style.display = "none", 8000);
  }

  function displayResults(results) {
    tableHead.style.display = results.length > 0 ? "table-header-group" : "none";
    resultLabel.textContent = `👥 លទ្ធផលស្វែងរក៖ ${results.length} CIF`;
    dataSourceLabel.textContent = results.length > 0 ? "⛁ ទិន្នន័យ​ពី:DatabaseCustomer" : "";

    resultsTable.innerHTML = results.map(item => `
      <tr>
        <td>${item.CIF || ''}</td>
        <td>${item.ACCOUNT_NAME || ''}</td>
        <td>${item.NAME_KHMER || ''}</td>
        <td>${item.GENDER || ''}</td>
        <td>${item.ADDRESS || ''}</td>
        <td>${item.Branch || ''}</td>
        <td>${item["CO Response"] || ''}</td>
        <td>${item.Note || ''}</td>
      </tr>`).join("");

    showTapHint();
  }

  function displayNBCOS(data) {
    tableHead.style.display = data.length > 0 ? "table-header-group" : "none";
    resultLabel.textContent = `👥 លទ្ធផលស្វែងរក៖ ${data.length} CIF`;
    dataSourceLabel.textContent = data.length > 0 ? "⛁ ទិន្នន័យ​ពី:DatabaseNBC_OS" : "";

    resultsTable.innerHTML = data.map(item => `
      <tr>
        <td>${item.LD_CUSTOMER_ID || ''}</td>
        <td>${item.NAME_KHMER || ''}</td>
        <td>${item.NAME_ENG || ''}</td>
        <td>${item.TITLE || ''}</td>
        <td>${item.Address || ''}</td>
        <td>${item["Branch-OK"] || ''}</td>
        <td>${item["Credit Officer"] || ''}</td>
        <td>${item["GovEmplyee/FactWorker"] || ''}</td>
      </tr>`).join("");

    showTapHint();
  }

  function performSearch() {
    const query = searchBox.value.trim();
    if (!query) return alert("សូមបញ្ចូលពាក្យគន្លិះ");

    document.getElementById("loadingOverlay").style.display = "flex";

    fetch(`https://secure-backend-tzj9.onrender.com/api/customers/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(results => {
      if (results.length > 0) {
        displayResults(results);
      } else {
        return fetch(`https://secure-backend-tzj9.onrender.com/api/nbcos/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()).then(nbcos => displayNBCOS(nbcos));
      }
    })
    .catch(err => alert("Search failed"))
    .finally(() => document.getElementById("loadingOverlay").style.display = "none");
  }

  // Event bindings
  searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  });

  searchButton.addEventListener("click", performSearch);

  // Hide detail panel on input
  searchBox.addEventListener("input", () => {
    nbcosDetail.style.display = "none";
    document.querySelectorAll("#results tbody tr").forEach(row => {
      row.style.display = "";
      row.classList.remove("highlighted-row");
    });
  });
}
