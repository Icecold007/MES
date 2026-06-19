document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("adminToken")) {
    window.location.href = "login.html";
  } else {
    document.getElementById("userDisplay").textContent =
      `Admin: ${localStorage.getItem("adminEmail")}`;
  }
});

const searchInput = document.getElementById("searchBarcode");
const searchBtn = document.getElementById("searchBtn");
const reportDisplay = document.getElementById("reportDisplay");
const noDataAlert = document.getElementById("noDataAlert");

searchBtn.addEventListener("click", executeTelemetrySearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") executeTelemetrySearch();
});

async function executeTelemetrySearch() {
  const barcode = searchInput.value.trim();
  if (!barcode) return;

  // Clear current display elements before rendering new results
  reportDisplay.style.display = "none";
  noDataAlert.style.display = "none";

  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `http://localhost:5000/api/draw/report/${encodeURIComponent(barcode)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 404) {
      noDataAlert.style.display = "block";
      return;
    }

    const result = await response.json();

    if (!response.ok) {
      alert(
        result.message || "An operational system error occurred querying data.",
      );
      return;
    }

    // Populate data into read-only display table cells
    const drawItem = result.data;
    document.getElementById("lblBarcode").textContent = drawItem.barcode_id;
    document.getElementById("lblPreform").textContent = drawItem.preform_id;
    document.getElementById("lblMachine").textContent = drawItem.machine;
    document.getElementById("lblOperator").textContent = drawItem.operator_name;
    document.getElementById("lblShift").textContent = `Shift ${drawItem.shift}`;
    document.getElementById("lblProduct").textContent = drawItem.product_type;
    document.getElementById("lblFiberCount").textContent = drawItem.fiber_count;
    document.getElementById("lblLength").textContent =
      `${drawItem.produced_length} Meters`;
    document.getElementById("lblDate").textContent = new Date(
      drawItem.production_date,
    ).toLocaleDateString();
    document.getElementById("lblTime").textContent = drawItem.production_time;
    document.getElementById("lblRemarks").textContent = drawItem.remarks
      ? drawItem.remarks
      : "No special quality remarks recorded.";

    // Reveal the read-only reporting table layout container element
    reportDisplay.style.display = "block";
  } catch (err) {
    alert("Failed to connect to backend engine processing network interfaces.");
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});
