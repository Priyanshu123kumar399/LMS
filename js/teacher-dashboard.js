document.addEventListener("DOMContentLoaded", async () => {
  const auth = window.LMSAuth;
  const store = window.LMSStore;
  const paths = window.LMSPaths;

  if (!auth || !store || !paths) {
    return;
  }

  await store.seed();

  if (!auth.requireTeacherAuth(paths.teacherLogin)) {
    return;
  }

  const teacher = auth.getCurrentTeacher();
  const courseForm = document.getElementById("teacherCourseForm");
  const quizForm = document.getElementById("teacherQuizForm");
  const assignmentForm = document.getElementById("teacherAssignmentForm");

  const courseList = document.getElementById("teacherCourseList");
  const quizList = document.getElementById("teacherQuizList");
  const assignmentList = document.getElementById("teacherAssignmentList");
  const submissionsBody = document.getElementById("teacherSubmissionsBody");
  const quizResultsBody = document.getElementById("teacherQuizResultsBody");

  const courseCount = document.getElementById("teacherCourseCount");
  const quizCount = document.getElementById("teacherQuizCount");
  const assignmentCount = document.getElementById("teacherAssignmentCount");
  const submissionCount = document.getElementById("teacherSubmissionCount");

  renderAll();

  courseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("teacherCourseTitle").value.trim();
    const category = document.getElementById("teacherCourseCategory").value.trim();
    const description = document.getElementById("teacherCourseDescription").value.trim();

    if (!title || !category || !description) {
      return;
    }

    const courses = store.getCourses();
    courses.unshift({
      id: `course-${Date.now()}`,
      title,
      category,
      description,
      status: "Pending",
      createdAt: new Date().toISOString(),
      publishedBy: teacher.email
    });
    store.saveCourses(courses);
    courseForm.reset();
    renderAll();
  });

  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const course = document.getElementById("teacherQuizCourse").value.trim();
    const question = document.getElementById("teacherQuizQuestion").value.trim();
    const options = document
      .getElementById("teacherQuizOptions")
      .value.split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const answer = document.getElementById("teacherQuizAnswer").value.trim();

    if (!course || !question || options.length < 2 || !answer) {
      return;
    }

    const quizzes = store.getQuizzes();
    quizzes.unshift({
      id: `quiz-${Date.now()}`,
      course,
      title: `${course} Quiz`,
      question,
      options,
      answer,
      status: "Pending",
      createdAt: new Date().toISOString(),
      publishedBy: teacher.email
    });
    store.saveQuizzes(quizzes);
    quizForm.reset();
    renderAll();
  });

  assignmentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const course = document.getElementById("teacherAssignmentCourse").value.trim();
    const title = document.getElementById("teacherAssignmentTitle").value.trim();
    const dueDate = document.getElementById("teacherAssignmentDue").value;
    const instructions = document.getElementById("teacherAssignmentInstructions").value.trim();

    if (!course || !title || !dueDate || !instructions) {
      return;
    }

    const assignments = store.getAssignments();
    assignments.unshift({
      id: `assignment-${Date.now()}`,
      course,
      title,
      dueDate,
      instructions,
      status: "Pending",
      createdAt: new Date().toISOString(),
      publishedBy: teacher.email
    });
    store.saveAssignments(assignments);
    assignmentForm.reset();
    renderAll();
  });

  submissionsBody.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-grade-submission]");
    if (!actionButton) {
      return;
    }

    const submissionId = actionButton.getAttribute("data-grade-submission");
    const marksInput = document.querySelector(`[data-marks-input="${submissionId}"]`);
    const feedbackInput = document.querySelector(`[data-feedback-input="${submissionId}"]`);

    const submissions = store.getSubmissions();
    const submissionIndex = submissions.findIndex((item) => item.id === submissionId);
    if (submissionIndex < 0) {
      return;
    }

    const marksValue = marksInput ? marksInput.value.trim() : "";
    const feedbackValue = feedbackInput ? feedbackInput.value.trim() : "";

    submissions[submissionIndex] = {
      ...submissions[submissionIndex],
      status: marksValue ? "Graded" : "Checked",
      marks: marksValue ? Number(marksValue) : submissions[submissionIndex].marks ?? null,
      feedback: feedbackValue,
      checkedAt: new Date().toISOString()
    };
    store.saveSubmissions(submissions);

    const marks = store.getMarks();
    marks.assignmentGrades = marks.assignmentGrades || [];
    const existingGradeIndex = marks.assignmentGrades.findIndex(
      (item) => item.submissionId === submissionId
    );

    const gradeRecord = {
      submissionId,
      assignmentId: submissions[submissionIndex].assignmentId,
      assignmentTitle: submissions[submissionIndex].assignmentTitle,
      title: submissions[submissionIndex].assignmentTitle,
      studentId: submissions[submissionIndex].studentId,
      studentName: submissions[submissionIndex].studentName,
      studentEmail: submissions[submissionIndex].studentEmail,
      marks: marksValue ? Number(marksValue) : submissions[submissionIndex].marks ?? null,
      feedback: feedbackValue,
      status: submissions[submissionIndex].status,
      updatedAt: new Date().toISOString()
    };

    if (existingGradeIndex >= 0) {
      marks.assignmentGrades[existingGradeIndex] = gradeRecord;
    } else {
      marks.assignmentGrades.unshift(gradeRecord);
    }

    store.saveMarks(marks);
    renderAll();
  });

  function renderAll() {
    const courses = store.getCourses();
    const quizzes = store.getQuizzes();
    const assignments = store.getAssignments();
    const submissions = store.getSubmissions();
    const marks = store.getMarks();

    courseCount.textContent = String(courses.length);
    quizCount.textContent = String(quizzes.length);
    assignmentCount.textContent = String(assignments.length);
    submissionCount.textContent = String(submissions.length);

    renderCourses(courses);
    renderQuizzes(quizzes);
    renderAssignments(assignments);
    renderSubmissions(submissions);
    renderQuizResults(marks.quizResults || []);
  }

  function renderCourses(courses) {
    courseList.innerHTML = courses.length
      ? courses
          .map(
            (course) => `
              <article class="teacher-item">
                <h3>${escapeHtml(course.title)}</h3>
                <p><strong>Category:</strong> ${escapeHtml(course.category)}</p>
                <p>${escapeHtml(course.description)}</p>
                <p><strong>Status:</strong> ${escapeHtml(course.status || "Pending")}</p>
              </article>
            `
          )
          .join("")
      : `<div class="teacher-empty">No courses added yet.</div>`;
  }

  function renderQuizzes(quizzes) {
    quizList.innerHTML = quizzes.length
      ? quizzes
          .map(
            (quiz) => `
              <article class="teacher-item">
                <h3>${escapeHtml(quiz.title || quiz.course)}</h3>
                <p><strong>Course:</strong> ${escapeHtml(quiz.course)}</p>
                <p>${escapeHtml(quiz.question)}</p>
                <ul>${quiz.options.map((option) => `<li>${escapeHtml(option)}</li>`).join("")}</ul>
                <p><strong>Status:</strong> ${escapeHtml(quiz.status || "Pending")}</p>
              </article>
            `
          )
          .join("")
      : `<div class="teacher-empty">No quizzes created yet.</div>`;
  }

  function renderAssignments(assignments) {
    assignmentList.innerHTML = assignments.length
      ? assignments
          .map(
            (assignment) => `
              <article class="teacher-item">
                <h3>${escapeHtml(assignment.title)}</h3>
                <p><strong>Course:</strong> ${escapeHtml(assignment.course)}</p>
                <p><strong>Due:</strong> ${formatDate(assignment.dueDate)}</p>
                <p><strong>Status:</strong> ${escapeHtml(assignment.status || "Pending")}</p>
                <p>${escapeHtml(assignment.instructions)}</p>
              </article>
            `
          )
          .join("")
      : `<div class="teacher-empty">No assignments published yet.</div>`;
  }

  function renderSubmissions(submissions) {
    if (!submissions.length) {
      submissionsBody.innerHTML = `
        <tr>
          <td colspan="8"><div class="teacher-empty">No submissions available yet.</div></td>
        </tr>
      `;
      return;
    }

    submissionsBody.innerHTML = submissions
      .map(
        (submission) => `
          <tr>
            <td>${escapeHtml(submission.assignmentTitle)}</td>
            <td>${escapeHtml(submission.course)}</td>
            <td>${escapeHtml(submission.studentName)}</td>
            <td>${escapeHtml(submission.fileName)}</td>
            <td><span class="teacher-badge ${badgeClass(submission.status)}">${escapeHtml(submission.status)}</span></td>
            <td><input class="form-control form-control-sm" type="number" min="0" max="100" value="${submission.marks ?? ""}" data-marks-input="${submission.id}"></td>
            <td><input class="form-control form-control-sm" type="text" value="${escapeHtmlForAttribute(submission.feedback || "")}" data-feedback-input="${submission.id}"></td>
            <td><button class="btn btn-sm btn-theme" type="button" data-grade-submission="${submission.id}">Save</button></td>
          </tr>
        `
      )
      .join("");
  }

  function renderQuizResults(results) {
    if (!quizResultsBody) {
      return;
    }

    if (!results.length) {
      quizResultsBody.innerHTML = `
        <tr>
          <td colspan="6"><div class="teacher-empty">No student quiz attempts yet.</div></td>
        </tr>
      `;
      return;
    }

    quizResultsBody.innerHTML = results
      .map(
        (result) => `
          <tr>
            <td>${escapeHtml(result.quizTitle || result.title)}</td>
            <td>${escapeHtml(result.course)}</td>
            <td>${escapeHtml(result.studentName)}</td>
            <td>${escapeHtml(result.score)}/${escapeHtml(result.total)}</td>
            <td><span class="teacher-badge ${badgeClass(result.status)}">${escapeHtml(result.status)}</span></td>
            <td>${escapeHtml(result.feedback || "")}</td>
          </tr>
        `
      )
      .join("");
  }
});

function badgeClass(status) {
  const normalized = String(status || "Pending").toLowerCase();
  if (normalized === "submitted") return "pending";
  if (normalized === "checked") return "pending";
  if (normalized === "graded") return "reviewed";
  return "pending";
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlForAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
