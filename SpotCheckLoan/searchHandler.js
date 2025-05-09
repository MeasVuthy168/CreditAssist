// ✅ SpotCheckLoan/searchHandler.js
export function setupSearch(token) {
  window.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.getElementById("searchBox");
    const searchButton = document.getElementById("searchButton");

    if (!searchBox || !searchButton) {
      console.warn("Search box or button not found.");
      return;
    }

    function performSearch() {
      const query = searchBox.value.trim();
      if (!query) {
        alert("សូមបញ្ចូលពាក្យគន្លិះ");
        return;
      }

      document.getElementById("loadingOverlay").style.display = "flex";

      fetch(`https://secure-backend-tzj9.onrender.com/api/customers/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
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
          alert("Search failed. Please try again.");
        })
        .finally(() => {
          document.getElementById("loadingOverlay").style.display = "none";
        });
    }

    searchButton.addEventListener("click", performSearch);
    searchBox.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    });
  });
}
