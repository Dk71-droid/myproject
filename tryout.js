// Tryout App - Final Version with Google Sheet Integration

let selectedFile = JSON.parse(localStorage.getItem("selectedFile"));
let questions = selectedFile ? selectedFile.questions : [];
let currentQuestionIndex = 0;
let totalScore = 0;

let userAnswers = new Array(questions.length).fill(null);
let doubtQuestions = new Array(questions.length).fill(false);

document.addEventListener("DOMContentLoaded", () => {
    if (!questions.length) {
        alert("Soal tidak ditemukan!");
        return;
    }
    loadQuestion();
    setTimer();
});

function loadQuestion() {
    let question = questions[currentQuestionIndex];
    let quizContainer = document.getElementById("quiz-container");
    quizContainer.style.position = "relative";

    let selectedAnswer = userAnswers[currentQuestionIndex];

    quizContainer.innerHTML = `
        <div class="question-header">
            <h3 style="font-size: 24px; font-family: 'Poppins', sans-serif; margin-bottom: 20px;">
                <strong>Soal ${currentQuestionIndex + 1}</strong>
            </h3>
            <button id="view-questions-btn" class="view-questions-btn">LIHAT SOAL</button>
        </div>
        <p class="question-text" style="font-size: 20px; font-family: 'Poppins', sans-serif; line-height: 1.6; margin-bottom: 20px;">
            <strong>${question.text}</strong>
        </p>
        <div class="options-container" style="display: flex; flex-direction: column; gap: 15px;">
            ${question.options.map((opt, index) => {
                let isChecked = selectedAnswer === index ? "checked" : "";
                let selectedClass = selectedAnswer === index ? "selected" : "";
                return `
                <div class="option-wrapper ${selectedClass}" data-index="${index}" 
                     style="background-color: #f3f3f3; padding: 15px; border-radius: 8px; cursor: pointer; 
                     transition: background 0.3s ease; font-size: 18px; font-family: 'Poppins', sans-serif; 
                     display: flex; align-items: center; gap: 10px; border: 2px solid transparent;">
                    <input type="radio" id="opt-${index}" name="q${currentQuestionIndex}" value="${opt.score}" ${isChecked} 
                           style="width: 20px; height: 20px; cursor: pointer;">
                    <label for="opt-${index}" class="option" style="cursor: pointer; width: 100%;">${opt.text}</label>
                </div>
                `;
            }).join("")}
        </div>
    `;

    document.querySelectorAll(".option-wrapper").forEach(option => {
        option.addEventListener("click", function () {
            let radio = this.querySelector("input[type='radio']");
            if (radio) radio.checked = true;
            document.querySelectorAll(".option-wrapper").forEach(opt => opt.classList.remove("selected"));
            this.classList.add("selected");
            let index = parseInt(this.getAttribute("data-index"));
            userAnswers[currentQuestionIndex] = index;
            updateQuestionGrid();
        });
    });

    let doubtBtn = document.getElementById("doubt-btn");
    if (doubtBtn) doubtBtn.style.backgroundColor = doubtQuestions[currentQuestionIndex] ? "#f1c40f" : "";

    document.getElementById("prev-btn").disabled = currentQuestionIndex === 0;
    document.getElementById("next-btn").innerHTML = currentQuestionIndex === questions.length - 1 ? "Selesai" : "Selanjutnya";

    document.getElementById("view-questions-btn").addEventListener("click", toggleQuestionGrid);
}

function navigate(direction) {
    currentQuestionIndex += direction;
    if (currentQuestionIndex >= questions.length) {
        showFinalScore();
    } else {
        loadQuestion();
    }
}

function markDoubt() {
    doubtQuestions[currentQuestionIndex] = !doubtQuestions[currentQuestionIndex];
    let doubtBtn = document.getElementById("doubt-btn");
    if (doubtBtn) doubtBtn.style.backgroundColor = doubtQuestions[currentQuestionIndex] ? "#f1c40f" : "";
    updateQuestionGrid();
}

function showFinalScore() {
    totalScore = 0;
    questions.forEach((question, index) => {
        let answerIndex = userAnswers[index];
        if (answerIndex != null) {
            totalScore += question.options[answerIndex].score;
        }
    });

    const maxScore = questions.reduce((sum, q) => sum + Math.max(...q.options.map(opt => opt.score)), 0);
    const finalPercent = Math.round((totalScore / maxScore) * 100);
    const quizContainer = document.getElementById("quiz-container");

    let nama = prompt("Masukkan nama Anda untuk leaderboard:");
    if (nama) kirimKeSpreadsheet(nama, finalPercent);

    quizContainer.innerHTML = `
        <div class="score-card">
            <h2>Hasil Tryout</h2>
            <p class="score-label">Skor Akhir: <span class="score-value">${totalScore}</span></p>
            <p class="score-label">Skor Maksimal: <span class="score-value">${maxScore}</span></p>
            <p class="score-label">Persentase Nilai: <span class="score-value">${finalPercent}%</span></p>
            <button onclick="location.reload()" class="restart-btn">Coba Lagi</button>
            <button onclick="openLeaderboardModal()" class="restart-btn" style="background:#3F51B5;">Lihat Leaderboard</button>
        </div>
        <div id="pembahasan-container" style="margin-top: 40px;"></div>
        <div id="leaderboard-container" style="display:none; margin-top: 20px;"></div>
    `;

    document.getElementById("prev-btn").style.display = "none";
    document.getElementById("next-btn").style.display = "none";
    if (document.getElementById("doubt-btn")) document.getElementById("doubt-btn").style.display = "none";

    showPembahasan();
    saveScoreToLeaderboard(finalPercent);
}

function showPembahasan() {
    const container = document.getElementById("pembahasan-container");
    container.innerHTML = "<h3 style='margin-bottom:20px;'>📘 Pembahasan Soal</h3>";

    questions.forEach((question, index) => {
        const userIndex = userAnswers[index];
        const userOption = userIndex != null ? question.options[userIndex] : null;
        const userAnswer = userOption ? userOption.key : "-";

        const correctOption = question.options.reduce((a, b) => a.score > b.score ? a : b);
        const correctAnswer = correctOption.key;

        const isCorrect = userAnswer === correctAnswer;

        const optionList = question.options.map(opt => {
            const color = opt.key === correctAnswer ? "#4CAF50" : "#e74c3c";
            return `<div style="margin-left: 15px; color:${color}">${opt.key}. ${opt.text} - ${opt.score} poin</div>`;
        }).join("");

        container.innerHTML += `
            <div style="margin-bottom: 30px; padding:15px; border: 1px solid #ddd; border-radius:8px; background:#fafafa;">
                <p><strong>Soal ${index + 1}</strong></p>
                <p style="margin-bottom:8px;">${question.text}</p>
                <p><strong style="color:#2196F3;">Jawaban Anda:</strong> ${userAnswer} (${isCorrect ? "✅" : "❌"})</p>
                <p><strong style="color:#2ecc71;">Kunci Jawaban:</strong></p>
                ${optionList}
                <p style="margin-top:10px;"><strong>Penjelasan:</strong><br>${question.explanation || "Tidak tersedia."}</p>
            </div>
        `;
    });
}


function saveScoreToLeaderboard(score) {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ score: score, date: new Date().toLocaleString() });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0, 5)));
}

function toggleLeaderboard() {
    const el = document.getElementById("leaderboard-container");
    if (el.style.display === "none") {
        showLeaderboard();
        el.style.display = "block";
    } else {
        el.style.display = "none";
    }
}

function showLeaderboard() {
    const soalId = selectedFile.fileName || "umum";
    const url = `https://script.google.com/macros/s/AKfycbyiZ4hG4Fcz6CjsVOeaqnbhihxScg5VU4n5Qkpfzti1FMy-aq2gxTFLoPcYhqxmtQeH/exec?soal=${soalId}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const top10 = data.sort((a, b) => b.skor - a.skor).slice(0, 10);
            const content = document.getElementById("leaderboard-content");
            content.innerHTML = `
                <ul style="text-align:left; font-size:16px;">
                    ${top10.map((e, i) => `
                        <li><strong>#${i + 1}</strong> - ${e.nama}: ${e.skor}</li>
                    `).join("")}
                </ul>
            `;
        })
        .catch(() => {
            document.getElementById("leaderboard-content").innerHTML = "<p>Gagal memuat leaderboard.</p>";
        });

    document.getElementById("leaderboard-modal").style.display = "flex";
}


function kirimKeSpreadsheet(nama, skor) {
    const soalId = selectedFile.fileName || "umum";
    fetch("https://script.google.com/macros/s/AKfycbzSt44LZUNjv3C9b1IyrxoD2YNU07W_VKjWbc1guq-HXlOp0jq66HbqGpFQAlWbKgjL/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, skor, id: soalId })
    });
}


// Timer
function setTimer() {
    const timerDisplay = document.getElementById("timer");
    const timerInput = prompt("Masukkan durasi waktu (dalam menit):");
    if (!timerInput || timerInput <= 0) return alert("Durasi tidak valid!");

    let totalTime = parseInt(timerInput) * 60;
    const timerInterval = setInterval(() => {
        let m = Math.floor(totalTime / 60);
        let s = totalTime % 60;
        timerDisplay.textContent = `${m}:${s < 10 ? "0" + s : s}`;
        totalTime--;

        if (totalTime === 600) timerDisplay.classList.add("timer-warning");
        if (totalTime < 0) {
            clearInterval(timerInterval);
            alert("Waktu habis!");
            showFinalScore();
        }
    }, 1000);
}

// Question Grid
function createQuestionGrid() {
    if (document.getElementById("question-grid-overlay")) return;
    let overlay = document.createElement("div");
    overlay.id = "question-grid-overlay";
    overlay.className = "question-grid-overlay";
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.style.display = "none"; });

    let gridContainer = document.createElement("div");
    gridContainer.id = "question-grid";
    gridContainer.className = "question-grid";

    let closeIcon = document.createElement("span");
    closeIcon.className = "close-question-grid";
    closeIcon.innerHTML = "&times;";
    closeIcon.onclick = () => overlay.style.display = "none";
    gridContainer.appendChild(closeIcon);

    let numbersContainer = document.createElement("div");
    numbersContainer.id = "numbers-container";
    gridContainer.appendChild(numbersContainer);

    overlay.appendChild(gridContainer);
    document.body.appendChild(overlay);
}

function updateQuestionGrid() {
    let container = document.getElementById("numbers-container");
    if (!container) return;
    container.innerHTML = "";
    questions.forEach((q, i) => {
        let btn = document.createElement("button");
        btn.innerText = i + 1;
        btn.className = "grid-number-btn";
        if (doubtQuestions[i]) btn.style.backgroundColor = "#f1c40f";
        else if (userAnswers[i] != null) btn.style.backgroundColor = "#2ecc71";
        else btn.style.backgroundColor = "#bdc3c7";

        btn.onclick = () => {
            currentQuestionIndex = i;
            loadQuestion();
            document.getElementById("question-grid-overlay").style.display = "none";
        };
        container.appendChild(btn);
    });
}

function toggleQuestionGrid() {
    createQuestionGrid();
    updateQuestionGrid();
    document.getElementById("question-grid-overlay").style.display = "block";
}
function openLeaderboardModal() {
    const modal = document.getElementById("leaderboard-modal");
    const content = document.getElementById("leaderboard-content");

    const soalId = selectedFile.fileName || "umum"; // misal 'soal1', 'soal2'
    const url = `https://script.google.com/macros/s/AKfycbyiZ4hG4Fcz6CjsVOeaqnbhihxScg5VU4n5Qkpfzti1FMy-aq2gxTFLoPcYhqxmtQeH/exec?id=${soalId}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const top10 = data.sort((a, b) => b.skor - a.skor).slice(0, 10);
            content.innerHTML = `
                <ul style="text-align:left;">
                    ${top10.map((e, i) => `
                        <li>#${i + 1} - ${e.nama}: ${e.skor}% (${e.tanggal})</li>
                    `).join("")}
                </ul>
            `;
        })
        .catch(() => {
            content.innerHTML = `<p>Gagal memuat leaderboard.</p>`;
        });

    modal.style.display = "flex";
}

function closeLeaderboardModal() {
    document.getElementById("leaderboard-modal").style.display = "none";
}
