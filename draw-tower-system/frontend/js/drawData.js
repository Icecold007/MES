document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("adminToken")) {
    window.location.href = "login.html";
  } else {
    document.getElementById("userDisplay").textContent =
      `Admin: ${localStorage.getItem("adminEmail")}`;
  }
});

const form = document.getElementById("drawDataForm");
const msgBox = document.getElementById("msgBox");
const submitBtn = document.getElementById("submitBtn");

function displayFeedback(text, isErr = true) {
  msgBox.textContent = text;
  msgBox.className = isErr ? "msg msg-error" : "msg msg-success";
  msgBox.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const autoBarcode = document.getElementById("barcodeAuto").value.trim();
  const manualBarcode = document.getElementById("barcodeManual").value.trim();

  if (!autoBarcode && !manualBarcode) {
    displayFeedback(
      "Data input conflict: You must supply a Barcode tracking ID using either the Auto box or Manual input slot.",
    );
    return;
  }
  if (autoBarcode && manualBarcode) {
    displayFeedback(
      "Data input conflict: Please use only ONE slot field choice for structural barcodes (Clear either Auto or Manual).",
    );
    return;
  }

  const finalBarcode = autoBarcode || manualBarcode;

  const preform_id = document.getElementById("preformId").value.trim();
  const machine = document.getElementById("machine").value;
  const operator_name = document.getElementById("operatorName").value.trim();
  const product_type = document.getElementById("productType").value;
  const fiber_count = document.getElementById("fiberCount").value;
  const produced_length = document.getElementById("producedLength").value;
  const production_date = document.getElementById("productionDate").value;
  const production_time = document
    .getElementById("productionTime")
    .value.trim();
  const remarks = document.getElementById("remarks").value.trim();

  const selectedShiftNode = document.querySelector(
    'input[name="shift"]:checked',
  );
  const shift = selectedShiftNode ? selectedShiftNode.value : "";

  submitBtn.disabled = true;
  submitBtn.innerHTML = `Saving Metrics Data Matrix... <span class="spinner"></span>`;

  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch("http://localhost:5000/api/draw/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        barcode_id: finalBarcode,
        preform_id,
        machine,
        operator_name,
        shift,
        product_type,
        fiber_count,
        produced_length,
        production_date,
        production_time,
        remarks,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      displayFeedback(
        data.message || "Error occurred saving structural record context.",
      );
    } else {
      displayFeedback(
        "Success! Draw Tower production item successfully logged into historical database layer.",
        false,
      );
      form.reset();
    }
  } catch (err) {
    displayFeedback(
      "Network timeout failure interacting with backend API routes server instance.",
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Production Data Row";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});
