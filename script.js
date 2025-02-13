let savedQuestions = JSON.parse(localStorage.getItem("savedQuestions")) || [];

// Membuka modal input soal
function openModal() {
  document.getElementById("modal").style.display = "flex";
}

// Menutup modal input soal
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Membuka modal Bank Soal
function openBankSoal() {
  let bankSoalContainer = document.getElementById("bank-soal-container");
  bankSoalContainer.innerHTML = "";

  savedQuestions.forEach((file) => {
    let fileButton = document.createElement("button");
    fileButton.textContent = file.fileName;
    fileButton.className = "modern-btn";
    fileButton.onclick = () => {
      localStorage.setItem("selectedFile", JSON.stringify(file));
      window.location.href = "tryout.html";
    };
    bankSoalContainer.appendChild(fileButton);
  });

  document.getElementById("bank-soal-modal").style.display = "flex";
}

// Menutup modal Bank Soal
function closeBankSoal() {
  document.getElementById("bank-soal-modal").style.display = "none";
}

// Fungsi untuk parsing input soal dari textarea
function parseInput() {
  let input = document.getElementById("soalInput").value.trim();
  if (!input) return null;
  let soalList = input.split("\n\n");
  let questions = soalList.map((item, index) => {
    let lines = item.split("\n");
    let text = lines[0];
    let options = lines.slice(1).map(opt => {
      let match = opt.match(/^([A-D])\.\s(.+)\s\((\d+)\)$/);
      return match ? { key: match[1], text: match[2], score: parseInt(match[3]) } : null;
    }).filter(opt => opt !== null);
    return { id: index + 1, text, options };
  });
  return questions;
}

// Menyimpan soal ke Bank Soal (localStorage)
function saveToBank() {
  let questions = parseInput();
  if (!questions) {
    alert("Masukkan soal terlebih dahulu.");
    return;
  }
  let fileName = prompt("Masukkan nama file soal untuk Bank Soal:");
  if (fileName) {
    savedQuestions.push({ fileName, questions });
    localStorage.setItem("savedQuestions", JSON.stringify(savedQuestions));
    alert("Soal berhasil disimpan ke Bank Soal!");
  }
  closeModal();
}

function saveToLocal() {
    try {
        let questions = parseInput();
        
        if (!questions || questions.length === 0) {
            alert("Masukkan soal terlebih dahulu.");
            return;
        }

        let fileName = prompt("Masukkan nama file (tanpa .json):");
        if (!fileName) return; // Jika user batal, hentikan proses

        let jsonData = JSON.stringify({ questions }, null, 2);
        let blob = new Blob([jsonData], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = fileName + ".json"; // Nama file sesuai input
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        alert("Soal berhasil disimpan sebagai file JSON.");
        closeModal();
    } catch (error) {
        alert("Terjadi kesalahan saat menyimpan soal.");
        console.error("Error saat menyimpan:", error);
    }
}


// Fungsi untuk mengunggah file JSON soal
function uploadFile(event) {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function(e) {
      try {
        let data = JSON.parse(e.target.result);
        // Data diharapkan memiliki struktur: { questions: [...] }
        let choice = confirm("Apakah Anda ingin menyimpan soal ke Bank Soal?\nKlik OK untuk menyimpan, Cancel untuk langsung membuka Tryout.");
        if (choice) {
          let fileName = prompt("Masukkan nama file soal:");
          if (fileName) {
            savedQuestions.push({ fileName, questions: data.questions });
            localStorage.setItem("savedQuestions", JSON.stringify(savedQuestions));
            alert("Soal berhasil disimpan ke Bank Soal!");
          }
        } else {
          localStorage.setItem("selectedFile", JSON.stringify(data));
          window.location.href = "tryout.html";
        }
      } catch (err) {
        alert("Gagal membaca file JSON.");
      }
    };
    reader.readAsText(file);
  }
}
