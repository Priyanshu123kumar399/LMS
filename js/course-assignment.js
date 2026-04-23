document.addEventListener("DOMContentLoaded", function () {
  // Get course name from URL parameters
  const params = new URLSearchParams(window.location.search);
  const courseName = params.get('course') || 'unknown-course';
  
  // Update page title with course name
  document.getElementById('courseTitle').innerText = decodeURIComponent(courseName).replace(/[-_]/g, ' ').toUpperCase();

  const submitBtn = document.getElementById("submitBtn");
  const fileInput = document.getElementById("fileInput");
  
  // Storage key for course-specific assignments
  const storageKey = `course_assignment_${courseName}_status`;

  // Check if already submitted for this course
  checkExistingSubmission();

  submitBtn.addEventListener("click", function () {

    const file = fileInput.files[0];

    if (!file) {
      alert("Please upload PDF!");
      return;
    }

    localStorage.setItem(storageKey, "Submitted");

    document.getElementById("submitStatus").innerText = "Submitted Successfully ✅";

    document.getElementById("afterOptions").style.display = "block";
    
    // Disable submit button and file input after submission
    submitBtn.disabled = true;
    fileInput.disabled = true;
  });

});

// Back to course details
function goBack() {
  window.history.back();
}

// Check Status
function checkStatus() {
  const params = new URLSearchParams(window.location.search);
  const courseName = params.get('course') || 'unknown-course';
  const storageKey = `course_assignment_${courseName}_status`;
  
  const status = localStorage.getItem(storageKey) || "Not Submitted";
  document.getElementById("statusText").innerText = "Status: " + status;
}

// Upload Again
function uploadAgain() {
  document.getElementById("fileInput").value = "";
  document.getElementById("submitStatus").innerText = "";
  document.getElementById("statusText").innerText = "";
  
  // Re-enable inputs for new upload
  document.getElementById("fileInput").disabled = false;
  document.getElementById("submitBtn").disabled = false;
  document.getElementById("afterOptions").style.display = "none";
}

// Check if already submitted for this course
function checkExistingSubmission() {
  const params = new URLSearchParams(window.location.search);
  const courseName = params.get('course') || 'unknown-course';
  const storageKey = `course_assignment_${courseName}_status`;
  
  const status = localStorage.getItem(storageKey);
  
  if (status === "Submitted") {
    document.getElementById("submitStatus").innerText = "✅ Already Submitted";
    document.getElementById("afterOptions").style.display = "block";
    document.getElementById("submitBtn").disabled = true;
    document.getElementById("fileInput").disabled = true;
  }
}

