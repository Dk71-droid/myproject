let selectedFile = JSON.parse(localStorage.getItem("selectedFile"));
let questions = selectedFile ? selectedFile.questions : [];
let currentQuestionIndex = 0;
let totalScore = 0;

// Array untuk menyimpan jawaban dan status ragu-ragu per soal
let userAnswers = new Array(questions.length).fill(null);
let doubtQuestions = new Array(questions.length).fill(false);

document.addEventListener("DOMContentLoaded", () => {
    if (!questions.length) {
        alert("Soal tidak ditemukan!");
        return;
    }
    loadQuestion();
});

function loadQuestion() {
    let question = questions[currentQuestionIndex];
    let quizContainer = document.getElementById("quiz-container");
    // Pastikan quizContainer memiliki posisi relatif agar tombol "Lihat Soal" bisa diposisikan secara absolut
    quizContainer.style.position = "relative";
    
    // Ambil jawaban yang tersimpan untuk soal ini (jika ada)
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

    // Tangani pemilihan opsi
    document.querySelectorAll(".option-wrapper").forEach(option => {
        option.addEventListener("click", function () {
            let radio = this.querySelector("input[type='radio']");
            if (radio) {
                radio.checked = true;
            }
            document.querySelectorAll(".option-wrapper").forEach(opt => opt.classList.remove("selected"));
            this.classList.add("selected");

            let index = parseInt(this.getAttribute("data-index"));
            userAnswers[currentQuestionIndex] = index;
            updateQuestionGrid();
        });
    });

    // Update tampilan tombol "Ragu-ragu" sesuai status soal ini
    let doubtBtn = document.getElementById("doubt-btn");
    if (doubtBtn) {
        doubtBtn.style.backgroundColor = doubtQuestions[currentQuestionIndex] ? "#f1c40f" : "";
    }

    // Nonaktifkan tombol "Sebelumnya" jika sudah di soal pertama
    document.getElementById("prev-btn").disabled = currentQuestionIndex === 0;

    let nextButton = document.getElementById("next-btn");
    nextButton.innerHTML = currentQuestionIndex === questions.length - 1 ? "Selesai" : "Selanjutnya";

    // Pasang event listener untuk tombol "Lihat Soal" yang baru saja dimasukkan
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

// Fungsi untuk menandai atau menghapus tanda ragu pada soal aktif
function markDoubt() {
    doubtQuestions[currentQuestionIndex] = !doubtQuestions[currentQuestionIndex];
    let doubtBtn = document.getElementById("doubt-btn");
    if (doubtBtn) {
        doubtBtn.style.backgroundColor = doubtQuestions[currentQuestionIndex] ? "#f1c40f" : "";
    }
    updateQuestionGrid();
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

        container.innerHTML += `
            <div class="question-text" style="margin-bottom: 25px;">
                <strong>Soal ${index + 1}:</strong> ${question.text}<br>
                Jawaban Anda: ${userAnswer} (${isCorrect ? "✅" : "❌"})<br>
                Kunci Jawaban: ${correctAnswer} - ${correctOption.text}<br>
                <em>Pembahasan:</em> ${question.explanation || "Tidak tersedia."}
            </div>
            <hr>
        `;
    });
}

function showFinalScore() {
    totalScore = 0;

    // Hitung total skor
    questions.forEach((question, index) => {
        const answerIndex = userAnswers[index];
        if (answerIndex != null) {
            totalScore += question.options[answerIndex].score;
        }
    });

    const maxScore = questions.reduce((sum, question) => {
        const highest = Math.max(...question.options.map(opt => opt.score));
        return sum + highest;
    }, 0);

    const finalPercent = Math.round((totalScore / maxScore) * 100);
    const quizContainer = document.getElementById("quiz-container");

    // MINTA NAMA USER
    let nama = prompt("Masukkan nama Anda untuk leaderboard:");
    if (nama) {
        kirimKeSpreadsheet(nama, finalPercent);
    }

    // TAMPILKAN SKOR
    quizContainer.innerHTML = `
        <div class="score-card">
            <h2>Hasil Tryout</h2>
            <p class="score-label">Skor Akhir: <span class="score-value">${totalScore}</span></p>
            <p class="score-label">Skor Maksimal: <span class="score-value">${maxScore}</span></p>
            <p class="score-label">Persentase Nilai: <span class="score-value">${finalPercent}%</span></p>
            <button onclick="location.reload()" class="restart-btn">Coba Lagi</button>
            <button onclick="toggleLeaderboard()" class="restart-btn" style="background:#3F51B5;">Lihat Leaderboard</button>
        </div>
        <div id="pembahasan-container" style="margin-top: 40px;"></div>
        <div id="leaderboard-container" style="display:none; margin-top: 20px;"></div>
    `;

    document.getElementById("prev-btn").style.display = "none";
    document.getElementById("next-btn").style.display = "none";
    const doubtBtn = document.getElementById("doubt-btn");
    if (doubtBtn) doubtBtn.style.display = "none";

    showPembahasan();
    saveScoreToLeaderboard(finalPercent);
}

    // SKOR UTAMA
    quizContainer.innerHTML = `
        <div class="score-card">
            <h2>Hasil Tryout</h2>
            <p class="score-label">Skor Akhir: <span class="score-value">${totalScore}</span></p>
            <p class="score-label">Skor Maksimal: <span class="score-value">${maxScore}</span></p>
            <p class="score-label">Persentase Nilai: <span class="score-value">${finalPercent}%</span></p>
            <button onclick="location.reload()" class="restart-btn">Coba Lagi</button>
            <button onclick="toggleLeaderboard()" class="restart-btn" style="background:#3F51B5;">Lihat Leaderboard</button>
        </div>
        <div id="pembahasan-container" style="margin-top: 40px;"></div>
        <div id="leaderboard-container" style="display:none; margin-top: 20px;"></div>
    `;

    // SEMBUNYIKAN TOMBOL
    document.getElementById("prev-btn").style.display = "none";
    document.getElementById("next-btn").style.display = "none";
    const doubtBtn = document.getElementById("doubt-btn");
    if (doubtBtn) doubtBtn.style.display = "none";

    // TAMPILKAN PEMBAHASAN
    showPembahasan();

    // SIMPAN SCORE
    saveScoreToLeaderboard(finalPercent);
}

function saveScoreToLeaderboard(score) {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const entry = {
        score: score,
        date: new Date().toLocaleString()
    };
    leaderboard.push(entry);
    const sorted = leaderboard.sort((a, b) => b.score - a.score).slice(0, 5);
    localStorage.setItem("leaderboard", JSON.stringify(sorted));
}

function toggleLeaderboard() {
    const leaderboardDiv = document.getElementById("leaderboard-container");
    if (leaderboardDiv.style.display === "none") {
        showLeaderboard();
        leaderboardDiv.style.display = "block";
    } else {
        leaderboardDiv.style.display = "none";
    }
}

function showLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const leaderboardDiv = document.getElementById("leaderboard-container");
    leaderboardDiv.innerHTML = `
        <div class="score-card">
            <h3>🏆 Peringkat Tertinggi</h3>
            <ul style="text-align:left;">
                ${leaderboard.map((entry, i) => `<li>#${i + 1} - ${entry.score}% (${entry.date})</li>`).join("")}
            </ul>
        </div>
    `;
}


// --- Bagian Timer & Font (tetap sama) ---
function updateFontSize(size) {
    document.getElementById("font-size-value").textContent = size + "px";
    document.querySelector(".question-text").style.fontSize = size + "px";
}
const increaseFontButton = document.getElementById('increase-font');
const decreaseFontButton = document.getElementById('decrease-font');
const quizContainer = document.getElementById('quiz-container');
const choiceElements = document.querySelectorAll('.choice');
let fontSize = 18;
function adjustFontSize(increase) {
    if (increase) {
        fontSize += 2;
    } else {
        fontSize -= 2;
    }
    quizContainer.style.fontSize = fontSize + 'px';
    choiceElements.forEach(choice => {
        choice.style.fontSize = fontSize + 'px';
    });
}
document.addEventListener("DOMContentLoaded", function() {
    let timerDisplay = document.getElementById("timer");
    let timerInterval;
    let initialTime = 0;
    function startTimer(minutes) {
        initialTime = minutes * 60;
        let totalTime = initialTime;
        timerInterval = setInterval(function() {
            let minutesLeft = Math.floor(totalTime / 60);
            let secondsLeft = totalTime % 60;
            timerDisplay.textContent = `${minutesLeft}:${secondsLeft < 10 ? '0' + secondsLeft : secondsLeft}`;
            totalTime--;
            if (totalTime <= 10 * 60 && totalTime > 9 * 60) {
                timerDisplay.classList.add("timer-warning");
                timerDisplay.classList.remove("timer-normal");
            } else if (totalTime <= initialTime && totalTime > 10 * 60) {
                timerDisplay.classList.add("timer-normal");
                timerDisplay.classList.remove("timer-warning");
            }
            if (totalTime < 0) {
                clearInterval(timerInterval);
                alert("Waktu habis!");
                setTimeout(function() {
                    showFinalScore();
                }, 1000);
            }
        }, 1000);
    }
    function setTimer() {
        const timerInput = prompt("Masukkan durasi waktu (dalam menit):");
        if (timerInput && timerInput > 0) {
            alert(`Timer diatur selama ${timerInput} menit!`);
            startTimer(parseInt(timerInput));
        } else {
            alert('Masukkan durasi waktu yang valid!');
        }
    }
    setTimer();
});

// --- Bagian untuk Question Grid Overlay ---
function createQuestionGrid() {
    // Jika overlay sudah ada, tidak perlu dibuat ulang
    if (document.getElementById("question-grid-overlay")) return;
    
    // Buat overlay container
    let overlay = document.createElement("div");
    overlay.id = "question-grid-overlay";
    overlay.className = "question-grid-overlay";
    // Klik di luar grid (overlay) akan menutup grid
    overlay.addEventListener("click", function(e) {
        if (e.target === overlay) {
            overlay.style.display = "none";
        }
    });

    // Buat box grid untuk nomor soal
    let gridContainer = document.createElement("div");
    gridContainer.id = "question-grid";
    gridContainer.className = "question-grid";
    // Tambahkan ikon silang untuk menutup
    let closeIcon = document.createElement("span");
    closeIcon.id = "close-question-grid";
    closeIcon.className = "close-question-grid";
    closeIcon.innerHTML = "&times;";
    closeIcon.addEventListener("click", function() {
        overlay.style.display = "none";
    });
    gridContainer.appendChild(closeIcon);

    let numbersContainer = document.createElement("div");
    numbersContainer.id = "numbers-container";
    numbersContainer.className = "numbers-container";
    gridContainer.appendChild(numbersContainer);

    overlay.appendChild(gridContainer);
    document.body.appendChild(overlay);
}

function updateQuestionGrid() {
    let numbersContainer = document.getElementById("numbers-container");
    if (!numbersContainer) return;
    numbersContainer.innerHTML = "";
    questions.forEach((q, i) => {
        let btn = document.createElement("button");
        btn.innerText = i + 1;
        btn.className = "grid-number-btn";
        // Warna status: ragu-ragu (kuning), sudah dikerjakan (hijau), belum dikerjakan (abu-abu)
        if (doubtQuestions[i]) {
            btn.style.backgroundColor = "#f1c40f";
        } else if (userAnswers[i] != null) {
            btn.style.backgroundColor = "#2ecc71";
        } else {
            btn.style.backgroundColor = "#bdc3c7";
        }
        btn.addEventListener("click", function() {
            currentQuestionIndex = i;
            loadQuestion();
            document.getElementById("question-grid-overlay").style.display = "none";
        });
        numbersContainer.appendChild(btn);
    });
}

function toggleQuestionGrid() {
    createQuestionGrid();
    let overlay = document.getElementById("question-grid-overlay");
    updateQuestionGrid();
    overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
}

function kirimKeSpreadsheet(nama, skor) {
    fetch("https://script.google.com/macros/s/AKfycbyiZ4hG4Fcz6CjsVOeaqnbhihxScg5VU4n5Qkpfzti1FMy-aq2gxTFLoPcYhqxmtQeH/exec", {
        method: "POST",
        mode: "no-cors", // penting buat bypass CORS Google
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nama: nama,
            skor: skor
        })
    }).then(() => {
        console.log("Terkirim ke Google Sheet!");
    }).catch(err => {
        console.error("Gagal kirim:", err);
    });
}




