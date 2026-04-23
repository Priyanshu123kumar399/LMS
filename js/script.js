const LMSPaths = (() => {
  const normalizedPath = window.location.pathname.replace(/\\/g, "/");
  const isTeacherPage = normalizedPath.includes("/teacher/");
  const rootPrefix = isTeacherPage ? "../" : "";

  return {
    isTeacherPage,
    rootPrefix,
    index: `${rootPrefix}index.html`,
    courses: `${rootPrefix}courses.html`,
    contact: `${rootPrefix}contact.html`,
    login: `${rootPrefix}log-in.html`,
    signup: `${rootPrefix}sign-up.html`,
    studentDashboard: `${rootPrefix}dashboard.html`,
    teacherLogin: `${rootPrefix}teacher-log-in.html`,
    teacherDashboard: isTeacherPage
      ? "teacher-dashboard.html"
      : "teacher/teacher-dashboard.html",
    assignmentsPage: `${rootPrefix}student-assignments.html`,
    quizPage: `${rootPrefix}quiz.html`,
    dataBase: `${rootPrefix}data/`
  };
})();

window.LMSPaths = LMSPaths;

const LMSStore = (() => {
  const keys = {
    students: "lms_shared_students",
    courses: "lms_shared_courses",
    quizzes: "lms_shared_quizzes",
    assignments: "lms_shared_assignments",
    submissions: "lms_shared_submissions",
    marks: "lms_shared_marks"
  };

  function read(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (parsed !== null) {
        return parsed;
      }
    } catch (error) {
      // use fallback
    }
    return fallback;
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async function loadJson(path, fallback) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Unable to load ${path}`);
      }
      return await response.json();
    } catch (error) {
      return fallback;
    }
  }

  async function seed() {
    if (localStorage.getItem("lms_shared_seeded") === "true") {
      return;
    }

    const students = await loadJson(`${LMSPaths.dataBase}students.json`, []);
    const courses = await loadJson(`${LMSPaths.dataBase}courses.json`, []);
    const quizzes = await loadJson(`${LMSPaths.dataBase}quiz.json`, []);
    const assignmentsData = await loadJson(`${LMSPaths.dataBase}assignments.json`, {
      assignments: [],
      submissions: []
    });
    const marks = await loadJson(`${LMSPaths.dataBase}marks.json`, {
      quizResults: [],
      assignmentGrades: []
    });

    write(keys.students, students);
    write(keys.courses, courses);
    write(keys.quizzes, quizzes);
    write(keys.assignments, assignmentsData.assignments || []);
    write(keys.submissions, assignmentsData.submissions || []);
    write(keys.marks, marks);
    localStorage.setItem("lms_shared_seeded", "true");
  }

  function getStudents() {
    return read(keys.students, []);
  }

  function saveStudents(value) {
    write(keys.students, value);
  }

  function getCourses() {
    return read(keys.courses, []);
  }

  function saveCourses(value) {
    write(keys.courses, value);
  }

  function getQuizzes() {
    return read(keys.quizzes, []);
  }

  function saveQuizzes(value) {
    write(keys.quizzes, value);
  }

  function getAssignments() {
    return read(keys.assignments, []);
  }

  function saveAssignments(value) {
    write(keys.assignments, value);
  }

  function getSubmissions() {
    return read(keys.submissions, []);
  }

  function saveSubmissions(value) {
    write(keys.submissions, value);
  }

  function getMarks() {
    return read(keys.marks, {
      quizResults: [],
      assignmentGrades: []
    });
  }

  function saveMarks(value) {
    write(keys.marks, value);
  }

  function upsertStudent(student) {
    if (!student || !student.email) {
      return;
    }

    const students = getStudents();
    const existingIndex = students.findIndex(
      (item) => String(item.email).toLowerCase() === String(student.email).toLowerCase()
    );
    const normalizedStudent = {
      id: student.id || `student-${Date.now()}`,
      name: student.name,
      email: student.email,
      joinedAt: student.joinedAt || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      students[existingIndex] = { ...students[existingIndex], ...normalizedStudent };
    } else {
      students.push(normalizedStudent);
    }

    saveStudents(students);
  }

  return {
    seed,
    getStudents,
    saveStudents,
    getCourses,
    saveCourses,
    getQuizzes,
    saveQuizzes,
    getAssignments,
    saveAssignments,
    getSubmissions,
    saveSubmissions,
    getMarks,
    saveMarks,
    upsertStudent
  };
})();

window.LMSStore = LMSStore;

window.addEventListener("load", () => {
  const pageLoader = document.querySelector(".js-page-loader");
  if (!pageLoader) {
    return;
  }

  pageLoader.classList.add("fade-out");
  setTimeout(() => {
    pageLoader.style.display = "none";
  }, 600);
});

function testimonialSlider() {
  const carouselOne = document.getElementById("carouselOne");
  const testimonialImg = document.querySelector(".js-testimonial-img");

  if (!carouselOne || !testimonialImg) {
    return;
  }

  carouselOne.addEventListener("slid.bs.carousel", function () {
    const activeItem = this.querySelector(".active");
    if (activeItem) {
      testimonialImg.src = activeItem.getAttribute("data-js-testimonial-img");
    }
  });
}

function coursePreviewVideo() {
  const coursePreviewModal = document.querySelector(".js-course-preview-modal");
  if (!coursePreviewModal) {
    return;
  }

  coursePreviewModal.addEventListener("shown.bs.modal", function () {
    const video = this.querySelector(".js-course-preview-video");
    if (!video) {
      return;
    }

    video.currentTime = 0;
    video.play();
  });

  coursePreviewModal.addEventListener("hide.bs.modal", function () {
    const video = this.querySelector(".js-course-preview-video");
    if (video) {
      video.pause();
    }
  });
}

function headerMenu() {
  const menu = document.querySelector(".header-menu");
  const backdrop = document.querySelector(".js-header-backdrop");
  const togglers = document.querySelectorAll(".js-header-manu-toggler");
  const menuCollapseBreakpoint = 991;

  if (!menu || !backdrop || togglers.length === 0) {
    return;
  }

  function toggleMenu() {
    menu.classList.toggle("open");
    backdrop.classList.toggle("active");
    document.body.classList.toggle("overflow-hidden");
  }

  function collapse() {
    const activeToggle = menu.querySelector(".js-toggle-sub-menu.active");
    if (!activeToggle) {
      return;
    }

    const activeSubMenu = activeToggle.nextElementSibling;
    if (activeSubMenu) {
      activeSubMenu.removeAttribute("style");
    }

    activeToggle.classList.remove("active");
    if (activeToggle.parentElement) {
      activeToggle.parentElement.classList.remove("active");
    }
  }

  togglers.forEach((item) => {
    item.addEventListener("click", toggleMenu);
  });

  backdrop.addEventListener("click", () => {
    if (menu.classList.contains("open")) {
      toggleMenu();
    }
  });

  menu.addEventListener("click", (event) => {
    const { target } = event;
    if (
      !target.classList.contains("js-toggle-sub-menu") ||
      window.innerWidth > menuCollapseBreakpoint
    ) {
      return;
    }

    event.preventDefault();

    const parentItem = target.parentElement;
    if (parentItem && parentItem.classList.contains("active")) {
      collapse();
      return;
    }

    collapse();

    target.classList.add("active");
    if (parentItem) {
      parentItem.classList.add("active");
    }

    const subMenu = target.nextElementSibling;
    if (subMenu) {
      subMenu.style.maxHeight = subMenu.scrollHeight + "px";
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > menuCollapseBreakpoint && menu.classList.contains("open")) {
      toggleMenu();
    }

    if (window.innerWidth > menuCollapseBreakpoint) {
      collapse();
    }
  });
}

function styleSwitcher() {
  const switcher = document.querySelector(".js-style-switcher");
  const switcherToggler = document.querySelector(".js-style-switcher-toggler");

  if (!switcher || !switcherToggler) {
    return;
  }

  switcherToggler.addEventListener("click", function () {
    switcher.classList.toggle("open");
    const icon = this.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-times");
      icon.classList.toggle("fa-cog");
    }
  });
}

function themeColors() {
  const colorStyle = document.querySelector(".js-color-style");
  const themeColorsContainer = document.querySelector(".js-theme-colors");

  if (!colorStyle || !themeColorsContainer) {
    return;
  }

  themeColorsContainer.addEventListener("click", ({ target }) => {
    if (!target.classList.contains("js-theme-color-item")) {
      return;
    }

    localStorage.setItem("color", target.getAttribute("data-js-theme-color"));
    setColor();
  });

  function setColor() {
    const currentHref = colorStyle.getAttribute("href");
    const savedColor = localStorage.getItem("color");
    if (!currentHref || !savedColor) {
      return;
    }

    const path = currentHref.split("/").slice(0, -1).join("/");
    colorStyle.setAttribute("href", `${path}/${savedColor}.css`);

    const activeColor = document.querySelector(".js-theme-color-item.active");
    if (activeColor) {
      activeColor.classList.remove("active");
    }

    const nextActive = document.querySelector(`[data-js-theme-color="${savedColor}"]`);
    if (nextActive) {
      nextActive.classList.add("active");
    }
  }

  if (localStorage.getItem("color")) {
    setColor();
    return;
  }

  const defaultColor = colorStyle.getAttribute("href").split("/").pop().split(".").shift();
  const defaultColorButton = document.querySelector(`[data-js-theme-color="${defaultColor}"]`);
  if (defaultColorButton) {
    defaultColorButton.classList.add("active");
  }
}

function themeLightDark() {
  const darkModeCheckbox = document.querySelector(".js-dark-mode");
  if (!darkModeCheckbox) {
    return;
  }

  function themeMode() {
    if (localStorage.getItem("theme-dark") === "false") {
      document.body.classList.remove("t-dark");
    } else {
      document.body.classList.add("t-dark");
    }
  }

  darkModeCheckbox.addEventListener("click", function () {
    localStorage.setItem("theme-dark", this.checked ? "true" : "false");
    themeMode();
  });

  if (localStorage.getItem("theme-dark") !== null) {
    themeMode();
  }

  darkModeCheckbox.checked = document.body.classList.contains("t-dark");
}

function themeGlassEffect() {
  const glassEffectCheckbox = document.querySelector(".js-glass-effect");
  const glassStyle = document.querySelector(".js-glass-style");

  if (!glassEffectCheckbox || !glassStyle) {
    return;
  }

  function applyGlass() {
    if (localStorage.getItem("glass-effect") === "true") {
      glassStyle.removeAttribute("disabled");
    } else {
      glassStyle.disabled = true;
    }
  }

  glassEffectCheckbox.addEventListener("click", function () {
    localStorage.setItem("glass-effect", this.checked ? "true" : "false");
    applyGlass();
  });

  if (localStorage.getItem("glass-effect") !== null) {
    applyGlass();
  }

  glassEffectCheckbox.checked = !glassStyle.hasAttribute("disabled");
}

(function setupAuthHelpers() {
  const USERS_KEY = "lms_users";
  const SESSION_KEY = "lms_current_user";
  const TEACHERS_KEY = "lms_teachers";
  const TEACHER_SESSION_KEY = "lms_current_teacher";
  const USER_SESSIONS_KEY = "lms_user_sessions";
  const TEACHER_SESSIONS_KEY = "lms_teacher_sessions";
  const DEMO_USER = {
    id: "user-demo-admin",
    name: "Admin User",
    email: "admin@gmail.com",
    password: "12345",
    joinedAt: "2026-04-23T00:00:00.000Z"
  };
  const DEMO_TEACHER = {
    id: "teacher-demo-1",
    name: "Teacher Admin",
    email: "teacher@gmail.com",
    password: "teacher123",
    joinedAt: "2026-04-23T00:00:00.000Z"
  };

  function getUsers() {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
      if (users.length > 0) {
        return users;
      }
    } catch (error) {
      // fall through to demo seed
    }

    localStorage.setItem(USERS_KEY, JSON.stringify([DEMO_USER]));
    return [DEMO_USER];
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function saveTeachers(teachers) {
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
  }

  function getTeachers() {
    try {
      const teachers = JSON.parse(localStorage.getItem(TEACHERS_KEY)) || [];
      if (teachers.length > 0) {
        return teachers;
      }
    } catch (error) {
      // fall through to demo seed
    }

    localStorage.setItem(TEACHERS_KEY, JSON.stringify([DEMO_TEACHER]));
    return [DEMO_TEACHER];
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (error) {
      return null;
    }
  }

  function setCurrentUser(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function getUserSessions() {
    try {
      return JSON.parse(localStorage.getItem(USER_SESSIONS_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveUserSessions(sessions) {
    localStorage.setItem(USER_SESSIONS_KEY, JSON.stringify(sessions));
  }

  function getCurrentTeacher() {
    try {
      return JSON.parse(localStorage.getItem(TEACHER_SESSION_KEY));
    } catch (error) {
      return null;
    }
  }

  function setCurrentTeacher(teacher) {
    localStorage.setItem(TEACHER_SESSION_KEY, JSON.stringify(teacher));
  }

  function getTeacherSessions() {
    try {
      return JSON.parse(localStorage.getItem(TEACHER_SESSIONS_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveTeacherSessions(sessions) {
    localStorage.setItem(TEACHER_SESSIONS_KEY, JSON.stringify(sessions));
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function signup({ name, email, password }) {
    const users = getUsers();
    const normalizedEmail = normalizeEmail(email);

    if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
      return { ok: false, message: "An account with this email already exists." };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: String(name || "").trim(),
      email: normalizedEmail,
      password: String(password || ""),
      role: "student",
      joinedAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    if (window.LMSStore) {
      window.LMSStore.upsertStudent(newUser);
    }
    return { ok: true, user: newUser };
  }

  function teacherSignup({ name, email, password }) {
    const teachers = getTeachers();
    const normalizedEmail = normalizeEmail(email);

    if (teachers.some((teacher) => normalizeEmail(teacher.email) === normalizedEmail)) {
      return { ok: false, message: "An account with this email already exists." };
    }

    const newTeacher = {
      id: `teacher-${Date.now()}`,
      name: String(name || "").trim(),
      email: normalizedEmail,
      password: String(password || ""),
      role: "teacher",
      joinedAt: new Date().toISOString()
    };

    teachers.push(newTeacher);
    saveTeachers(teachers);
    setCurrentTeacher(newTeacher);
    return { ok: true, teacher: newTeacher };
  }

  function login({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const user = getUsers().find(
      (item) => normalizeEmail(item.email) === normalizedEmail && item.password === password
    );

    if (!user) {
      return { ok: false, message: "Invalid email or password." };
    }

    setCurrentUser(user);
    const sessions = getUserSessions().filter(
      (item) => normalizeEmail(item.email) !== normalizedEmail
    );
    sessions.unshift({
      id: `session-${Date.now()}`,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: "student",
      loggedInAt: new Date().toISOString()
    });
    saveUserSessions(sessions);
    if (window.LMSStore) {
      window.LMSStore.upsertStudent(user);
    }
    return { ok: true, user };
  }

  function teacherLogin({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    const teacher = getTeachers().find(
      (item) => normalizeEmail(item.email) === normalizedEmail && item.password === password
    );

    if (!teacher) {
      return { ok: false, message: "Invalid teacher email or password." };
    }

    setCurrentTeacher(teacher);
    const sessions = getTeacherSessions().filter(
      (item) => normalizeEmail(item.email) !== normalizedEmail
    );
    sessions.unshift({
      id: `teacher-session-${Date.now()}`,
      teacherId: teacher.id,
      name: teacher.name,
      email: teacher.email,
      role: "teacher",
      loggedInAt: new Date().toISOString()
    });
    saveTeacherSessions(sessions);
    return { ok: true, teacher };
  }

  function logout() {
    const currentUser = getCurrentUser();
    localStorage.removeItem(SESSION_KEY);
    if (currentUser) {
      const remainingSessions = getUserSessions().filter(
        (item) => normalizeEmail(item.email) !== normalizeEmail(currentUser.email)
      );
      saveUserSessions(remainingSessions);
    }
  }

  function logoutTeacher() {
    const currentTeacher = getCurrentTeacher();
    localStorage.removeItem(TEACHER_SESSION_KEY);
    if (currentTeacher) {
      const remainingSessions = getTeacherSessions().filter(
        (item) => normalizeEmail(item.email) !== normalizeEmail(currentTeacher.email)
      );
      saveTeacherSessions(remainingSessions);
    }
  }

  function requireAuth(redirectTo) {
    if (getCurrentUser()) {
      return true;
    }

    window.location.href = redirectTo || LMSPaths.login;
    return false;
  }

  function requireTeacherAuth(redirectTo) {
    if (getCurrentTeacher()) {
      return true;
    }

    window.location.href = redirectTo || LMSPaths.teacherLogin;
    return false;
  }

  function syncAuthMenu() {
    const menus = document.querySelectorAll(".header-menu .js-sub-menu");

    menus.forEach((menu) => {
      menu.innerHTML = `
        <li class="sub-menu-item"><a href="${LMSPaths.login}">Login</a></li>
        <li class="sub-menu-item"><a href="${LMSPaths.signup}">Sign Up</a></li>
      `;
    });
  }

  document.addEventListener("click", (event) => {
    const logoutLink = event.target.closest("[data-auth-logout]");
    if (!logoutLink) {
      return;
    }

    event.preventDefault();
    const role = logoutLink.getAttribute("data-auth-logout");

    if (role === "teacher") {
      logoutTeacher();
      syncAuthMenu();
      window.location.href = LMSPaths.teacherLogin;
      return;
    }

    logout();
    syncAuthMenu();
    window.location.href = LMSPaths.login;
  });

  window.LMSAuth = {
    getUsers,
    getTeachers,
    getCurrentUser,
    getCurrentTeacher,
    getUserSessions,
    getTeacherSessions,
    login,
    teacherLogin,
    logout,
    logoutTeacher,
    requireAuth,
    requireTeacherAuth,
    signup,
    teacherSignup,
    syncAuthMenu
  };
})();

function showMessage(element, message, type) {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = `alert mt-3 ${type === "success" ? "alert-success" : "alert-danger"}`;
  element.classList.remove("d-none");
}

function setupLoginForm(auth) {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) {
    return;
  }

  const feedback = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const roleField = loginForm.querySelector("input[name='loginRole']:checked");
    const selectedRole = roleField ? roleField.value : "student";

    if (!email || !password) {
      showMessage(feedback, "Please enter your email and password.", "error");
      return;
    }

    const result =
      selectedRole === "teacher"
        ? auth.teacherLogin({ email, password })
        : auth.login({ email, password });

    if (!result.ok) {
      showMessage(feedback, result.message, "error");
      return;
    }

    showMessage(feedback, "Login successful. Redirecting to your dashboard...", "success");
    setTimeout(() => {
      window.location.href =
        selectedRole === "teacher" ? LMSPaths.teacherDashboard : LMSPaths.studentDashboard;
    }, 700);
  });
}

function setupTeacherLoginForm(auth) {
  const teacherLoginForm = document.getElementById("teacherLoginForm");
  if (!teacherLoginForm) {
    return;
  }

  const feedback = document.getElementById("teacherLoginMessage");

  teacherLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("teacherLoginEmail").value.trim();
    const password = document.getElementById("teacherLoginPassword").value;

    if (!email || !password) {
      showMessage(feedback, "Please enter teacher email and password.", "error");
      return;
    }

    const result = auth.teacherLogin({ email, password });
    if (!result.ok) {
      showMessage(feedback, result.message, "error");
      return;
    }

    showMessage(feedback, "Teacher login successful. Redirecting...", "success");
    setTimeout(() => {
      window.location.href = LMSPaths.teacherDashboard;
    }, 700);
  });
}

function setupSignupForm(auth) {
  const signupForm = document.getElementById("signupForm");
  if (!signupForm) {
    return;
  }

  const feedback = document.getElementById("signupMessage");

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;
    const roleField = signupForm.querySelector("input[name='signupRole']:checked");
    const selectedRole = roleField ? roleField.value : "student";

    if (!name || !email || !password || !confirmPassword) {
      showMessage(feedback, "Please fill in all signup fields.", "error");
      return;
    }

    if (password.length < 6) {
      showMessage(feedback, "Password must be at least 6 characters long.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage(feedback, "Passwords do not match.", "error");
      return;
    }

    const result =
      selectedRole === "teacher"
        ? auth.teacherSignup({ name, email, password })
        : auth.signup({ name, email, password });

    if (!result.ok) {
      showMessage(feedback, result.message, "error");
      return;
    }

    showMessage(feedback, "Account created successfully. Redirecting to your dashboard...", "success");
    setTimeout(() => {
      window.location.href =
        selectedRole === "teacher" ? LMSPaths.teacherDashboard : LMSPaths.studentDashboard;
    }, 700);
  });
}

function setupDashboard(auth) {
  if (document.body.dataset.page !== "dashboard") {
    return;
  }

  if (!auth.requireAuth(LMSPaths.login)) {
    return;
  }

  const user = auth.getCurrentUser();
  if (!user) {
    return;
  }

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const joinedDate = new Date(user.joinedAt);
  const formattedJoinDate = Number.isNaN(joinedDate.getTime())
    ? "Recently"
    : joinedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

  document.querySelectorAll("[data-user-name]").forEach((element) => {
    element.textContent = user.name;
  });

  document.querySelectorAll("[data-user-email]").forEach((element) => {
    element.textContent = user.email;
  });

  document.querySelectorAll("[data-user-joined]").forEach((element) => {
    element.textContent = formattedJoinDate;
  });

  document.querySelectorAll("[data-user-initials]").forEach((element) => {
    element.textContent = initials || "U";
  });

  renderStudentDashboardData(user);
}

function setupTeacherDashboard(auth) {
  if (document.body.dataset.page !== "teacher-dashboard") {
    return;
  }

  if (!auth.requireTeacherAuth(LMSPaths.teacherLogin)) {
    return;
  }

  const teacher = auth.getCurrentTeacher();
  if (!teacher) {
    return;
  }

  const initials = teacher.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const joinedDate = new Date(teacher.joinedAt);
  const formattedJoinDate = Number.isNaN(joinedDate.getTime())
    ? "Recently"
    : joinedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

  document.querySelectorAll("[data-teacher-name]").forEach((element) => {
    element.textContent = teacher.name;
  });

  document.querySelectorAll("[data-teacher-email]").forEach((element) => {
    element.textContent = teacher.email;
  });

  document.querySelectorAll("[data-teacher-joined]").forEach((element) => {
    element.textContent = formattedJoinDate;
  });

  document.querySelectorAll("[data-teacher-initials]").forEach((element) => {
    element.textContent = initials || "T";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const auth = window.LMSAuth;
  LMSStore.seed().then(() => {
    if (auth) {
      const currentUser = auth.getCurrentUser();
      if (currentUser) {
        LMSStore.upsertStudent(currentUser);
      }
    }
  });
  testimonialSlider();
  coursePreviewVideo();
  headerMenu();
  styleSwitcher();
  themeColors();
  themeLightDark();
  themeGlassEffect();

  if (!auth) {
    return;
  }

  auth.syncAuthMenu();
  setupLoginForm(auth);
  setupTeacherLoginForm(auth);
  setupSignupForm(auth);
  setupDashboard(auth);
  setupTeacherDashboard(auth);
});

function renderStudentDashboardData(user) {
  const coursesContainer = document.getElementById("studentCoursesList");
  const assignmentsContainer = document.getElementById("studentAssignmentsList");
  const quizzesContainer = document.getElementById("studentQuizzesList");
  const feedbackContainer = document.getElementById("studentFeedbackList");

  if (!coursesContainer || !assignmentsContainer || !quizzesContainer || !feedbackContainer) {
    return;
  }

  const courses = LMSStore.getCourses();
  const assignments = LMSStore.getAssignments();
  const quizzes = LMSStore.getQuizzes();
  const submissions = LMSStore.getSubmissions().filter(
    (item) => String(item.studentEmail).toLowerCase() === String(user.email).toLowerCase()
  );
  const marks = LMSStore.getMarks();
  const studentQuizResults = (marks.quizResults || []).filter(
    (item) => String(item.studentEmail).toLowerCase() === String(user.email).toLowerCase()
  );
  const studentAssignmentGrades = [
    ...(marks.assignmentGrades || []).filter(
      (item) => String(item.studentEmail).toLowerCase() === String(user.email).toLowerCase()
    ),
    ...submissions
      .filter((item) => item.status === "Checked" || item.status === "Graded")
      .map((item) => ({
        submissionId: item.id,
        assignmentTitle: item.assignmentTitle,
        title: item.assignmentTitle,
        studentEmail: item.studentEmail,
        marks: item.marks,
        feedback: item.feedback,
        status: item.status,
        updatedAt: item.checkedAt || item.submittedAt
      }))
  ];

  coursesContainer.innerHTML = courses.length
    ? courses
        .slice(0, 4)
        .map(
          (course) => `
            <div class="dashboard-data-item">
              <h4>${escapeHtml(course.title)}</h4>
              <p>${escapeHtml(course.description || course.category || "New course material available.")}</p>
            </div>
          `
        )
        .join("")
    : `<p class="dashboard-empty">No courses published yet.</p>`;

  assignmentsContainer.innerHTML = assignments.length
    ? assignments
        .slice(0, 4)
        .map((assignment) => {
          const submission = submissions.find((item) => item.assignmentId === assignment.id);
          const status = submission ? submission.status : assignment.status || "Pending";
          return `
            <div class="dashboard-data-item">
              <h4>${escapeHtml(assignment.title)}</h4>
              <p>${escapeHtml(assignment.course)} • Due ${formatShortDate(assignment.dueDate)}</p>
              <p>Status: <strong>${escapeHtml(status)}</strong></p>
              <a class="btn btn-theme btn-sm" href="${LMSPaths.assignmentsPage}">Open Assignment</a>
            </div>
          `;
        })
        .join("")
    : `<p class="dashboard-empty">No assignments published yet.</p>`;

  quizzesContainer.innerHTML = quizzes.length
    ? quizzes
        .slice(0, 4)
        .map((quiz) => {
          const result = studentQuizResults.find((item) => item.quizId === quiz.id);
          return `
            <div class="dashboard-data-item">
              <h4>${escapeHtml(quiz.title || quiz.course)}</h4>
              <p>${escapeHtml(quiz.question)}</p>
              <p>Status: <strong>${result ? `Completed (${result.score}/${result.total})` : "Pending"}</strong></p>
              <a class="btn btn-theme btn-sm" href="${LMSPaths.quizPage}?quiz=${encodeURIComponent(quiz.id)}">Take Quiz</a>
            </div>
          `;
        })
        .join("")
    : `<p class="dashboard-empty">No quizzes published yet.</p>`;

  const feedbackItems = [...studentAssignmentGrades, ...studentQuizResults]
    .sort((a, b) => new Date(b.updatedAt || b.completedAt || 0) - new Date(a.updatedAt || a.completedAt || 0))
    .slice(0, 5);

  feedbackContainer.innerHTML = feedbackItems.length
    ? feedbackItems
        .map((item) => {
          const label = item.quizId ? "Quiz" : "Assignment";
          const scoreText = item.quizId
            ? `${item.score}/${item.total}`
            : `${item.marks ?? "-"} marks`;
          const feedback = item.feedback || "Awaiting detailed feedback.";
          return `
            <div class="dashboard-data-item">
              <h4>${label}: ${escapeHtml(item.title || item.assignmentTitle || item.quizTitle || "Record")}</h4>
              <p>Result: <strong>${escapeHtml(scoreText)}</strong></p>
              <p>${escapeHtml(feedback)}</p>
            </div>
          `;
        })
        .join("")
    : `<p class="dashboard-empty">No marks or feedback yet.</p>`;
}

function formatShortDate(value) {
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
