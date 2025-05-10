// ✅ SpotCheckLoan/searchHandler.js

export function setupSearch(token) {
  const searchBox = document.getElementById("searchBox");
  const searchButton = document.getElementById("searchButton");

  function performSearch() {
    const query = searchBox.value.trim();
    console.log("Search triggered. Query:", query);

    if (!query) {
      alert("សូមបញ្ចូលពាក្យគន្លិះ");
      return;
    }

    document.getElementById("loadingOverlay").style.display = "flex";

    fetch(`https://secure-backend-tzj9.onrender.com/api/customers/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Search results:", data);
        const resultLabel = document.getElementById("resultLabel");
        const dataSourceLabel = document.getElementById("dataSourceLabel");
        const tapHint = document.getElementById("tapHint");
        const tableBody = document.querySelector("#results tbody");
        const tableHead = document.querySelector("#results thead");

        tableBody.innerHTML = "";
        if (data.length > 0) {
          resultLabel.textContent = `👥 លទ្ធផលស្វែងរក៖ ${data.length} CIF`;
          dataSourceLabel.textContent = "⛁ ទិន្នន័យ​ពី:DatabaseCustomer";
          tapHint.style.display = "flex";
          setTimeout(() => tapHint.style.display = "none", 8000);
          tableHead.style.display = "table-header-group";

          tableBody.innerHTML = data.map(item => `
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
        } else {
          resultLabel.textContent = "🚫 រកមិនឃើញលទ្ធផលទេ";
          dataSourceLabel.textContent = "";
        }
      })
      .catch(err => {
        console.error("Search error:", err);
        alert("Search failed.");
      })
      .finally(() => {
        document.getElementById("loadingOverlay").style.display = "none";
      });
  }

  // Add event listeners immediately
  if (searchButton && searchBox) {
    searchButton.addEventListener("click", performSearch);
    searchBox.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    });
  } else {
    console.warn("Search box or button not found.");
  }
}
