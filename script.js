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
// Membuka modal Bank Soal (ambil dari GitHub)
async function openBankSoal() {
  const bankSoalContainer = document.getElementById("bank-soal-container");
  bankSoalContainer.innerHTML = "";

  try {
    const response = await fetch("https://api.github.com/repos/Dk71-droid/myproject/contents/data");
    const files = await response.json();

    files.forEach(file => {
      if (file.name.endsWith(".json")) {
        const button = document.createElement("button");

        // Format nama file, contoh: soal1.json => Soal 1
        const label = file.name
          .replace(".json", "")
          .replace(/soal/i, "Soal ")
          .replace(/(\d+)/, match => `${match}`);

        button.textContent = label;
        button.className = "modern-btn";
        button.onclick = async () => {
          const soalResponse = await fetch(file.download_url);
          const soalData = await soalResponse.json();
          localStorage.setItem("selectedFile", JSON.stringify(soalData));
          window.location.href = "tryout.html";
        };
        bankSoalContainer.appendChild(button);
      }
    });

    document.getElementById("bank-soal-modal").style.display = "flex";
  } catch (err) {
    alert("Gagal memuat daftar soal dari GitHub.");
    console.error(err);
  }
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
// Menampilkan soal dari localStorage dan memungkinkan rename
function showSavedQuestions() {
  const container = document.getElementById("bank-soal-container");
  const section = document.createElement("div");
  section.innerHTML = "<h3>Soal Lokal (LocalStorage)</h3>";

  if (savedQuestions.length === 0) {
    section.innerHTML += "<p>Tidak ada soal tersimpan.</p>";
    container.appendChild(section);
    return;
  }

  savedQuestions.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "10px";

    const input = document.createElement("input");
    input.type = "text";
    input.value = item.fileName;
    input.id = `rename-${index}`;
    input.style.marginRight = "10px";

    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    renameBtn.onclick = () => {
      const newName = document.getElementById(`rename-${index}`).value.trim();
      if (newName && !savedQuestions.some(q => q.fileName === newName)) {
        savedQuestions[index].fileName = newName;
        localStorage.setItem("savedQuestions", JSON.stringify(savedQuestions));
        alert("Nama file berhasil diubah.");
        showSavedQuestions(); // Refresh tampilan
      } else {
        alert("Nama tidak valid atau sudah dipakai.");
      }
    };

    const openBtn = document.createElement("button");
    openBtn.textContent = "Buka";
    openBtn.style.marginLeft = "10px";
    openBtn.onclick = () => {
      localStorage.setItem("selectedFile", JSON.stringify({ questions: savedQuestions[index].questions }));
      window.location.href = "tryout.html";
    };

    wrapper.appendChild(input);
    wrapper.appendChild(renameBtn);
    wrapper.appendChild(openBtn);
    section.appendChild(wrapper);
  });

  container.appendChild(section);
}

