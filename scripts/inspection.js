const factoryDropdown = document.getElementById("factoryDropdown");
const lineDropdown = document.getElementById("lineDropdown");

const lineOptions = {
  L7: ["E1", "E1A", "E2B", "E5", "E4", "E6"],
  L9: ["G1", "G2", "G3", "G4", "G5", "G6"],
  F28: ["H1", "H2", "H3", "H4", "H5", "H6"],
  F29: ["D1", "D2", "D3", "D4", "D5", "D6"],
  F30: ["F1", "F2", "F3", "F4", "F5", "F6"],
  F31: ["K1", "K2", "K3", "K4", "K5", "K6"],
  F25: ["PR1", "PR2", "PR3", "PR4", "EMB"],
  F8: ["Z1", "Z2", "Z3"],
};

factoryDropdown.addEventListener("change", function () {
  const selectedFactory = factoryDropdown.value;
  lineDropdown.innerHTML = '<option value="">--Select--</option>';

  if (selectedFactory && lineOptions[selectedFactory]) {
    lineOptions[selectedFactory].forEach((line) => {
      const option = document.createElement("option");
      option.value = line;
      option.textContent = line;
      lineDropdown.appendChild(option);
    });
  }
});

function decrement(btn) {
  const span = btn.parentElement.querySelector("span");
  let value = parseInt(span.innerText, 10);
  span.innerText = value + 1;
}

function increment(btn) {
  const span = btn.parentElement.querySelector("span");
  let value = parseInt(span.innerText, 10);
  if (value > 0) {
    span.innerText = value - 1;
  }
}

document.getElementById("submitBtn").addEventListener("click", async function () {
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.style.display = "none";

  const getValue = (id) => document.getElementById(id)?.value || "";

  const data = {
    auditType: getValue("auditType"),
    factory: getValue("factoryDropdown"),
    line: getValue("lineDropdown"),
    orderQty: getValue("orderQty"),
    aql: getValue("aql"),
    auditDate: getValue("auditDate"),
    cutNumber: getValue("cutNumber"),
    packedQty: getValue("packedQty"),
    sampleSize: getValue("sampleSize"),
    auditor: getValue("auditor"),
    styleNumber: getValue("styleNumber"),
    auditNo: getValue("auditNo"),
    defectsFound: getValue("defectsFound"),
    results: getValue("results"),
    patternNumber: getValue("patternNumber"),
    gmtDescription: getValue("gmtDescription"),
    noOfBoxes: getValue("noOfBoxes"),
    rating: getValue("rating"),
    remarks: document.querySelector(".remark-textarea")?.value || "",
    defects: {},
  };

  document.querySelectorAll(".defects-table tr td").forEach((td) => {
    const label = td.querySelector("label");
    const count = td.querySelector("span");
    if (label && count) {
      data.defects[label.innerText.trim()] = parseInt(count.innerText, 10);
    }
  });

  try {
    const response = await fetch("http://localhost:5000/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Data submitted successfully, generating screenshot PDF...");

    // Generate screenshot-based PDF
    html2canvas(document.body).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "mm", "a4");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("final-inspection-report.pdf");

      submitBtn.style.display = "inline-block";
      alert("Report submitted and screenshot-based PDF downloaded.");
    });

  } catch (error) {
    console.error("Error submitting or generating report:", error);
    alert("Failed to submit or download report.");
    submitBtn.style.display = "inline-block";
  }
});
