document.addEventListener("DOMContentLoaded", function () {

  const submitBtn = document.getElementById("submitBtn");

  submitBtn.addEventListener("click", function () {

    const file = document.getElementById("fileInput").files[0];

    if (!file) {
      alert("Please upload PDF!");
      return;
    }

    localStorage.setItem("assignment_status", "Pending");

    document.getElementById("submitStatus").innerText = "Submitted Successfully ✅";

    document.getElementById("afterOptions").style.display = "block";
  });

});

// Back
function goBack() {
  window.location.href = "index.html";
}

// Check Status
function checkStatus() {
  const status = localStorage.getItem("assignment_status") || "Not Submitted";
  document.getElementById("statusText").innerText = "Status: " + status;
}

// Upload Again
function uploadAgain() {
  document.getElementById("fileInput").value = "";
  document.getElementById("submitStatus").innerText = "";
  document.getElementById("statusText").innerText = "";
}