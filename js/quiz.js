const quizData = [
  {
    question: "What is the full form of HTML?",
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper Tool Multi Language",
      "None"
    ],
    correct: 0
  },
  {
    question: "Which tag is used for heading?",
    options: ["<h1>", "<p>", "<div>", "<span>"],
    correct: 0
  },
  {
    question: "Which tag is used for image?",
    options: ["<img>", "<image>", "<pic>", "<src>"],
    correct: 0
  },
  {
    question: "Which tag is used for link?",
    options: ["<a>", "<link>", "<href>", "<url>"],
    correct: 0
  },
  {
    question: "Which tag is used for paragraph?",
    options: ["<p>", "<para>", "<text>", "<h1>"],
    correct: 0
  }
];

let currentQuestion = 0;
let score = 0;
let answers = new Array(quizData.length).fill(null);

const quizArea = document.getElementById("quizArea");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const submitBtn = document.getElementById("submitBtn");
const resultCard = document.getElementById("resultCard");
const resultText = document.getElementById("resultText");
const qCount = document.getElementById("qCount");

qCount.innerText = quizData.length + " Questions";

function loadQuestion() {
  const q = quizData[currentQuestion];

  let html = `<h3>Q${currentQuestion + 1}. ${q.question}</h3>`;

  for (let i = 0; i < q.options.length; i++) {
    let optionText = q.options[i]
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html += `
      <div style="margin:10px 0;">
        <input type="radio" name="option" value="${i}"
        ${answers[currentQuestion] === i ? "checked" : ""}>
        ${optionText}
      </div>
    `;
  }

  quizArea.innerHTML = html;

  prevBtn.style.display = currentQuestion === 0 ? "none" : "inline-block";
  nextBtn.style.display = currentQuestion === quizData.length - 1 ? "none" : "inline-block";
  submitBtn.style.display = currentQuestion === quizData.length - 1 ? "inline-block" : "none";
}

quizArea.addEventListener("change", (e) => {
  if (e.target.name === "option") {
    answers[currentQuestion] = parseInt(e.target.value);
  }
});

nextBtn.onclick = () => {
  currentQuestion++;
  loadQuestion();
};

prevBtn.onclick = () => {
  currentQuestion--;
  loadQuestion();
};

submitBtn.onclick = () => {
  score = 0;

  for (let i = 0; i < quizData.length; i++) {
    if (answers[i] === quizData[i].correct) {
      score++;
    }
  }

  resultCard.classList.remove("hidden");
  document.querySelector(".card").classList.add("hidden");

  resultText.innerText = "Your Score: " + score + " / " + quizData.length;
};

document.getElementById("retryBtn").onclick = () => {
  currentQuestion = 0;
  score = 0;
  answers.fill(null);

  resultCard.classList.add("hidden");
  document.querySelector(".card").classList.remove("hidden");

  loadQuestion();
};

loadQuestion();
