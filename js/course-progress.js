document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("courseVideo");
  const quizBtn = document.getElementById("quizBtn");
  if (!video || !quizBtn) return;

  const courseId = document.body.getAttribute("data-course") || "course";
  const key = "lms_course_done_" + courseId;

  // quiz link auto-set
  quizBtn.href = "quiz.html?course=" + encodeURIComponent(courseId);

  // if already unlocked
  if (localStorage.getItem(key) === "true") {
    quizBtn.style.display = "inline-block";
    return;
  }

  // unlock ONLY when video ends
  video.addEventListener("ended", () => {
    localStorage.setItem(key, "true");
    quizBtn.style.display = "inline-block";
  });
});