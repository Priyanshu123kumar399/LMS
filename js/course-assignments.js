document.addEventListener("DOMContentLoaded", function () {

  const submitBtn = document.getElementById("submitBtn");
  
  // Get course from URL parameter for storage key
  const params = new URLSearchParams(window.location.search);
  const courseName = params.get('course') || 'default';

  submitBtn.addEventListener("click", function () {

    const file = document.getElementById("fileInput").files[0];

    if (!file) {
      alert("Please upload PDF!");
      return;
    }

    localStorage.setItem(`course_assignment_${courseName}_status`, "Pending");

    document.getElementById("submitStatus").innerText = "Submitted Successfully ✅";

    document.getElementById("afterOptions").style.display = "block";
  });

});

// Back to course page
function goBack() {
  window.history.back();
}

// Check Status
function checkStatus() {
  const params = new URLSearchParams(window.location.search);
  const courseName = params.get('course') || 'default';
  const status = localStorage.getItem(`course_assignment_${courseName}_status`) || "Not Submitted";
  document.getElementById("statusText").innerText = "Status: " + status;
}

// Upload Again
function uploadAgain() {
  document.getElementById("fileInput").value = "";
  document.getElementById("submitStatus").innerText = "";
  document.getElementById("statusText").innerText = "";
}

