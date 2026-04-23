document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submitBtn");
  const answerField = document.getElementById("answer");
  const statusText = document.getElementById("status");

  if (!submitBtn || !answerField || !statusText) {
    return;
  }

  const savedAnswer = localStorage.getItem("assignment_answer");
  if (savedAnswer) {
    answerField.value = savedAnswer;
    statusText.textContent = "Draft restored from your last submission.";
  }

  submitBtn.addEventListener("click", () => {
    const answer = answerField.value.trim();
    if (!answer) {
      statusText.textContent = "Please write your answer before submitting.";
      return;
    }

    localStorage.setItem("assignment_answer", answer);
    localStorage.setItem("assignment_status", "Submitted");
    statusText.textContent = "Assignment submitted successfully.";
  });
});
