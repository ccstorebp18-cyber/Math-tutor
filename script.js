/* =========================================================
   ANGKA — Belajar Matematika dengan AI
   script.js

   CATATAN ARSITEKTUR:
   Semua "kecerdasan" AI dipusatkan di objek AIEngine di bawah.
   Saat ini isinya generator soal lokal berbasis aturan/level
   (tanpa API key, langsung jalan di GitHub Pages).

   Untuk upgrade ke AI beneran nanti, kamu HANYA perlu mengganti
   isi fungsi-fungsi di dalam AIEngine (generateQuestion,
   evaluateSession, getChatReply) menjadi fetch() ke API
   (misalnya lewat backend/serverless function yang menyimpan
   API key dengan aman). Struktur di luar AIEngine tidak perlu
   diubah karena semua sudah dipanggil lewat AIEngine.xxx().
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     1. AI ENGINE — bank soal, generator, evaluasi, chat
     ========================================================= */
  const AIEngine = (function () {

    function randInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function pick(arr) {
      return arr[randInt(0, arr.length - 1)];
    }
    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = randInt(0, i);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    /* ---------------------------------------------------
       Generator soal per topik.
       Setiap generator return: { question, answer, topicLabel }
       answer disimpan sebagai string yang sudah dinormalisasi.
    --------------------------------------------------- */

    function genAritmatikaDasar(difficulty) {
      const range = difficulty === "dasar" ? 20 : difficulty === "menengah" ? 100 : 500;
      const ops = ["+", "-", "×"];
      const op = pick(ops);
      let a = randInt(2, range);
      let b = randInt(2, range);
      if (op === "-" && b > a) [a, b] = [b, a];
      if (op === "×") { a = randInt(2, Math.min(range, 20)); b = randInt(2, 12); }
      let answer;
      if (op === "+") answer = a + b;
      else if (op === "-") answer = a - b;
      else answer = a * b;
      return {
        question: `Hitung hasil dari:\n${a} ${op} ${b} = ...`,
        answer: String(answer),
        topicLabel: "Aritmatika dasar",
      };
    }

    function genAljabarLinear(difficulty) {
      const coefRange = difficulty === "dasar" ? 5 : difficulty === "menengah" ? 12 : 25;
      const a = randInt(2, coefRange);
      const x = randInt(1, difficulty === "mahir" ? 30 : 15);
      const b = randInt(1, coefRange * 2);
      const sign = pick(["+", "-"]);
      const c = sign === "+" ? a * x + b : a * x - b;
      const question = `Hitung nilai x:\n${a}x ${sign} ${b} = ${c}`;
      return { question, answer: String(x), topicLabel: "Aljabar linear" };
    }

    function genPecahan(difficulty) {
      const maxDenom = difficulty === "dasar" ? 6 : difficulty === "menengah" ? 10 : 14;
      let d1 = randInt(2, maxDenom);
      let d2 = randInt(2, maxDenom);
      let n1 = randInt(1, d1 - 1);
      let n2 = randInt(1, d2 - 1);
      // hasil dibuat pecahan sederhana: samakan penyebut agar hasil bisa desimal rapi
      const op = pick(["+", "-"]);
      if (op === "-" && (n1 / d1) < (n2 / d2)) { [n1, d1, n2, d2] = [n2, d2, n1, d1]; }
      const num = op === "+" ? (n1 * d2 + n2 * d1) : (n1 * d2 - n2 * d1);
      const den = d1 * d2;
      const g = gcd(Math.abs(num), den);
      const simpNum = num / g;
      const simpDen = den / g;
      return {
        question: `Hitung dan sederhanakan:\n${n1}/${d1} ${op} ${n2}/${d2} = ...\n(tulis dalam bentuk a/b, contoh: 3/4)`,
        answer: `${simpNum}/${simpDen}`,
        topicLabel: "Pecahan",
        altAnswers: simpDen === 1 ? [String(simpNum)] : [],
      };
    }

    function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

    function genPersentase(difficulty) {
      const bases = difficulty === "dasar" ? [10, 20, 25, 50] : difficulty === "menengah" ? [10, 15, 20, 25, 30, 40, 60, 75] : [12, 18, 24, 35, 45, 65, 85];
      const persen = pick(bases);
      const total = difficulty === "dasar" ? randInt(2, 20) * 10 : randInt(5, 60) * 10;
      const answer = Math.round((persen / 100) * total);
      return {
        question: `Berapa ${persen}% dari ${total}?`,
        answer: String(answer),
        topicLabel: "Persentase",
      };
    }

    function genGeometriKeliling(difficulty) {
      const shapes = difficulty === "dasar"
        ? ["persegi"]
        : difficulty === "menengah"
        ? ["persegi", "persegi panjang"]
        : ["persegi panjang", "segitiga sama sisi"];
      const shape = pick(shapes);
      if (shape === "persegi") {
        const s = randInt(2, difficulty === "dasar" ? 15 : 40);
        return {
          question: `Sebuah persegi memiliki sisi ${s} cm.\nBerapa keliling persegi tersebut? (dalam cm)`,
          answer: String(s * 4),
          topicLabel: "Geometri — keliling",
        };
      } else if (shape === "persegi panjang") {
        const p = randInt(3, 30), l = randInt(2, p - 1 || 2);
        return {
          question: `Sebuah persegi panjang memiliki panjang ${p} cm dan lebar ${l} cm.\nBerapa kelilingnya? (dalam cm)`,
          answer: String(2 * (p + l)),
          topicLabel: "Geometri — keliling",
        };
      } else {
        const s = randInt(3, 25);
        return {
          question: `Sebuah segitiga sama sisi memiliki panjang sisi ${s} cm.\nBerapa kelilingnya? (dalam cm)`,
          answer: String(s * 3),
          topicLabel: "Geometri — keliling",
        };
      }
    }

    function genGeometriLuas(difficulty) {
      if (difficulty === "dasar") {
        const s = randInt(2, 12);
        return {
          question: `Sebuah persegi memiliki sisi ${s} cm.\nBerapa luasnya? (dalam cm²)`,
          answer: String(s * s),
          topicLabel: "Geometri — luas",
        };
      } else if (difficulty === "menengah") {
        const p = randInt(4, 20), l = randInt(2, 15);
        return {
          question: `Sebuah persegi panjang memiliki panjang ${p} cm dan lebar ${l} cm.\nBerapa luasnya? (dalam cm²)`,
          answer: String(p * l),
          topicLabel: "Geometri — luas",
        };
      } else {
        const a = randInt(4, 24), t = randInt(3, 20);
        return {
          question: `Sebuah segitiga memiliki alas ${a} cm dan tinggi ${t} cm.\nBerapa luasnya? (dalam cm²)`,
          answer: String((a * t) / 2),
          topicLabel: "Geometri — luas",
        };
      }
    }

    function genAljabarKuadratSederhana(difficulty) {
      // hanya untuk level mahir: persamaan kuadrat dengan akar bulat sederhana, bentuk (x-a)(x-b)=0, minta akar positif terkecil
      const r1 = randInt(1, 8);
      const r2 = randInt(1, 8);
      const b = -(r1 + r2);
      const c = r1 * r2;
      const bTerm = b === 0 ? "" : (b > 0 ? ` + ${b}x` : ` - ${Math.abs(b)}x`);
      const question = `Salah satu akar dari persamaan berikut adalah bilangan bulat terkecil.\nx²${bTerm} + ${c} = 0\nBerapa nilai akar terkecil tersebut?`;
      return {
        question,
        answer: String(Math.min(r1, r2)),
        topicLabel: "Aljabar — persamaan kuadrat",
      };
    }

    function genPerbandingan(difficulty) {
      const a = randInt(2, difficulty === "dasar" ? 6 : 12);
      const b = randInt(2, difficulty === "dasar" ? 6 : 12);
      const mult = randInt(2, difficulty === "mahir" ? 15 : 8);
      const totalA = a * mult;
      return {
        question: `Perbandingan uang Andi dan Budi adalah ${a} : ${b}.\nJika uang Andi adalah ${totalA}, berapa uang Budi?`,
        answer: String(b * mult),
        topicLabel: "Perbandingan (rasio)",
      };
    }

    // Kumpulan generator per level kesulitan
    const GENERATORS = {
      dasar: [genAritmatikaDasar, genGeometriKeliling, genGeometriLuas, genPersentase, genPerbandingan],
      menengah: [genAritmatikaDasar, genAljabarLinear, genPecahan, genPersentase, genGeometriKeliling, genGeometriLuas, genPerbandingan],
      mahir: [genAljabarLinear, genPecahan, genGeometriLuas, genAljabarKuadratSederhana, genPersentase, genPerbandingan],
    };

    function generateQuestion(difficulty, usedTypes) {
      const pool = GENERATORS[difficulty] || GENERATORS.dasar;
      const gen = pick(pool);
      return gen(difficulty);
    }

    /* ---------------------------------------------------
       Tes kemampuan: soal berjenjang, makin sulit kalau benar
    --------------------------------------------------- */
    function generateTestQuestion(stepIndex, runningDifficulty) {
      // stepIndex 0-based. Difficulty naik/turun berdasarkan runningDifficulty ("dasar"/"menengah"/"mahir")
      return generateQuestion(runningDifficulty);
    }

    function normalizeAnswer(str) {
      return String(str).trim().toLowerCase().replace(/\s+/g, "").replace(",", ".");
    }

    function checkAnswer(userAnswer, correctAnswer, altAnswers) {
      const u = normalizeAnswer(userAnswer);
      const c = normalizeAnswer(correctAnswer);
      if (u === c) return true;
      if (altAnswers && altAnswers.some(a => normalizeAnswer(a) === u)) return true;
      // toleransi desimal kecil kalau keduanya angka
      const uNum = parseFloat(u);
      const cNum = parseFloat(c);
      if (!isNaN(uNum) && !isNaN(cNum) && Math.abs(uNum - cNum) < 0.01) return true;
      return false;
    }

    /* ---------------------------------------------------
       Evaluasi hasil tes kemampuan -> tentukan level
    --------------------------------------------------- */
    function evaluateTestResult(results) {
      // results: [{correct: bool, difficulty: 'dasar'|'menengah'|'mahir', timeMs}]
      let score = 0;
      results.forEach(r => {
        if (r.correct) {
          score += r.difficulty === "mahir" ? 3 : r.difficulty === "menengah" ? 2 : 1;
        }
      });
      const maxPossible = results.length * 3;
      const ratio = score / maxPossible;

      let level;
      if (ratio >= 0.66) level = "mahir";
      else if (ratio >= 0.35) level = "menengah";
      else level = "dasar";

      const correctCount = results.filter(r => r.correct).length;

      return { level, correctCount, total: results.length, score };
    }

    /* ---------------------------------------------------
       Evaluasi hasil sesi belajar -> nilai + saran
    --------------------------------------------------- */
    function evaluateSession(results, totalTimeSec, level) {
      const correctCount = results.filter(r => r.correct).length;
      const total = results.length;
      const accuracyScore = (correctCount / total) * 100;

      const avgTimePerQ = totalTimeSec / total;
      // skor kecepatan ringan, hanya sebagai bonus kecil, tidak mendominasi
      let speedBonus = 0;
      if (avgTimePerQ < 20) speedBonus = 5;
      else if (avgTimePerQ > 90) speedBonus = -5;

      const finalScore = Math.max(0, Math.min(100, Math.round(accuracyScore + speedBonus)));

      // Saran berdasarkan topik yang salah
      const wrongTopics = {};
      results.forEach(r => {
        if (!r.correct) {
          wrongTopics[r.topicLabel] = (wrongTopics[r.topicLabel] || 0) + 1;
        }
      });
      const wrongTopicList = Object.keys(wrongTopics).sort((a, b) => wrongTopics[b] - wrongTopics[a]);

      let advice = "";
      if (correctCount === total) {
        advice = `Sempurna, semua ${total} soal terjawab benar! Kecepatanmu rata-rata ${Math.round(avgTimePerQ)} detik per soal. Kamu siap mencoba level yang lebih menantang — coba lagi nanti untuk lihat apakah levelmu naik.`;
      } else if (correctCount === 0) {
        advice = `Sepertinya soal-soal kali ini masih terasa berat. Tidak apa-apa — coba pelajari dulu dasar-dasar ${wrongTopicList[0] || "topik ini"}, lalu coba lagi. Pelan-pelan, yang penting paham prosesnya.`;
      } else {
        const topicNote = wrongTopicList.length
          ? `Kamu masih perlu berlatih lebih di bagian ${wrongTopicList.slice(0, 2).join(" dan ")}.`
          : `Beberapa jawaban meleset, coba lebih teliti saat menghitung ulang.`;
        const timeNote = avgTimePerQ > 90
          ? " Waktumu cukup lama per soal — coba gunakan kertas coret-coret untuk mempercepat proses berpikir."
          : avgTimePerQ < 15
          ? " Kecepatanmu bagus, tapi coba sedikit lebih teliti supaya akurasinya naik."
          : "";
        advice = `Kamu menjawab benar ${correctCount} dari ${total} soal. ${topicNote}${timeNote}`;
      }

      return { finalScore, correctCount, total, advice };
    }

    /* ---------------------------------------------------
       Chat AI — jawaban berbasis pola kata kunci (lokal)
    --------------------------------------------------- */
    const CHAT_RULES = [
      {
        keywords: ["pecahan"],
        reply: "Pecahan itu seperti membagi kue jadi beberapa potong sama besar. Misal 3/4 artinya kue dibagi 4 potong, kamu ambil 3. Untuk menjumlahkan pecahan, samakan dulu penyebutnya (angka di bawah), baru jumlahkan pembilangnya (angka di atas). Ada soal pecahan tertentu yang mau kamu tanyakan?",
      },
      {
        keywords: ["aljabar", "persamaan", "x ="],
        reply: "Untuk menyelesaikan persamaan linear seperti ax + b = c, langkahnya:\n1. Pindahkan b ke ruas kanan (jadi ax = c - b)\n2. Bagi kedua ruas dengan a (jadi x = (c-b)/a)\nCoba kirim soal spesifik yang kamu bingungkan, nanti aku bantu langkah demi langkah.",
      },
      {
        keywords: ["persen", "%", "persentase"],
        reply: "Menghitung persentase dari suatu angka: ubah dulu persen jadi pecahan per-100, lalu kalikan dengan angkanya. Contoh: 20% dari 50 = (20/100) × 50 = 10. Mau coba soal persentase yang lain?",
      },
      {
        keywords: ["keliling"],
        reply: "Keliling itu total panjang seluruh sisi bangun datar. Untuk persegi: keliling = 4 × sisi. Untuk persegi panjang: keliling = 2 × (panjang + lebar). Ada bangun datar tertentu yang mau kamu tanyakan?",
      },
      {
        keywords: ["luas"],
        reply: "Luas mengukur seberapa besar permukaan suatu bangun datar. Persegi: luas = sisi × sisi. Persegi panjang: luas = panjang × lebar. Segitiga: luas = (alas × tinggi) / 2. Mau aku bantu hitung salah satu soal luas?",
      },
      {
        keywords: ["kuadrat"],
        reply: "Persamaan kuadrat berbentuk ax² + bx + c = 0. Salah satu cara menyelesaikannya adalah dengan pemfaktoran: cari dua angka yang jika dikalikan menghasilkan c dan jika dijumlahkan menghasilkan b. Kirim soalnya kalau mau aku bantu telusuri.",
      },
      {
        keywords: ["susah", "sulit", "bingung", "gak ngerti", "tidak mengerti"],
        reply: "Wajar kok kalau masih bingung — matematika memang butuh latihan berulang. Coba ceritakan soal spesifik yang bikin kamu tersangkut, nanti kita pecahkan pelan-pelan bareng-bareng.",
      },
      {
        keywords: ["makasih", "terima kasih", "thanks"],
        reply: "Sama-sama! Semangat terus belajarnya 💪 Kalau nemu soal lain yang bikin bingung, tanya aja lagi ya.",
      },
    ];

    function getChatReply(userMessage) {
      const msg = userMessage.toLowerCase();
      for (const rule of CHAT_RULES) {
        if (rule.keywords.some(k => msg.includes(k))) {
          return rule.reply;
        }
      }
      // fallback umum
      return "Aku masih belajar memahami pertanyaan yang lebih kompleks di versi ini. Coba tanyakan topik seperti pecahan, aljabar, persentase, keliling, luas, atau persamaan kuadrat — atau kirim soal spesifiknya, nanti aku bantu jelaskan langkah-langkahnya.";
    }

    return {
      generateQuestion,
      generateTestQuestion,
      checkAnswer,
      evaluateTestResult,
      evaluateSession,
      getChatReply,
    };
  })();

  /* =========================================================
     2. STATE
     ========================================================= */
  const state = {
    userLevel: localStorage.getItem("angka_level") || null, // 'dasar' | 'menengah' | 'mahir'

    test: {
      totalQuestions: 8,
      currentIndex: 0,
      results: [], // {correct, difficulty, topicLabel, timeMs}
      currentQuestion: null,
      currentDifficulty: "menengah", // mulai dari menengah, adaptif naik/turun
      startTime: null,
      timerInterval: null,
    },

    learn: {
      totalQuestions: 10,
      currentIndex: 0,
      results: [],
      currentQuestion: null,
      sessionStartTime: null,
      questionStartTime: null,
      timerInterval: null,
    },
  };

  /* =========================================================
     3. NAVIGATION
     ========================================================= */
  function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("page-active"));
    document.getElementById(pageId).classList.add("page-active");
    window.scrollTo(0, 0);
  }

  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-go");
      if (target === "home") {
        stopTimer(state.test);
        stopTimer(state.learn);
        renderHome();
        showPage("page-home");
      }
    });
  });

  function renderHome() {
    const box = document.getElementById("level-status-box");
    const val = document.getElementById("level-status-value");
    if (state.userLevel) {
      box.hidden = false;
      val.textContent = levelLabel(state.userLevel);
    } else {
      box.hidden = true;
    }
  }

  function levelLabel(level) {
    return { dasar: "Dasar", menengah: "Menengah", mahir: "Mahir" }[level] || "—";
  }

  /* =========================================================
     4. TIMER helper
     ========================================================= */
  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function startTimer(container, displayEl) {
    container.startTime = Date.now();
    container.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - container.startTime) / 1000;
      displayEl.textContent = formatTime(elapsed);
    }, 500);
  }

  function stopTimer(container) {
    if (container.timerInterval) {
      clearInterval(container.timerInterval);
      container.timerInterval = null;
    }
  }

  /* =========================================================
     5. TES KEMAMPUAN
     ========================================================= */
  const btnGotoTest = document.getElementById("btn-goto-test");
  const testTimerEl = document.getElementById("test-timer");
  const testProgressLabel = document.getElementById("test-progress-label");
  const testProgressFill = document.getElementById("test-progress-fill");
  const testEyebrow = document.getElementById("test-eyebrow");
  const testQuestionEl = document.getElementById("test-question");
  const testAnswerInput = document.getElementById("test-answer-input");
  const testNextBtn = document.getElementById("test-next-btn");

  btnGotoTest.addEventListener("click", () => {
    state.test.currentIndex = 0;
    state.test.results = [];
    state.test.currentDifficulty = "menengah";
    showPage("page-test");
    loadTestQuestion();
    stopTimer(state.test);
    startTimer(state.test, testTimerEl);
  });

  function loadTestQuestion() {
    const idx = state.test.currentIndex;
    const q = AIEngine.generateTestQuestion(idx, state.test.currentDifficulty);
    state.test.currentQuestion = q;
    state.test.questionStartTime = Date.now();

    testProgressLabel.textContent = `Soal ${idx + 1}/${state.test.totalQuestions}`;
    testProgressFill.style.width = `${((idx) / state.test.totalQuestions) * 100}%`;
    testEyebrow.textContent = `Menentukan level — ${q.topicLabel}`;
    testQuestionEl.textContent = q.question;
    testAnswerInput.value = "";
    testAnswerInput.focus();
  }

  function submitTestAnswer() {
    const q = state.test.currentQuestion;
    const userAnswer = testAnswerInput.value.trim();
    const correct = userAnswer !== "" && AIEngine.checkAnswer(userAnswer, q.answer, q.altAnswers);
    const timeMs = Date.now() - state.test.questionStartTime;

    state.test.results.push({
      correct,
      difficulty: state.test.currentDifficulty,
      topicLabel: q.topicLabel,
      timeMs,
    });

    // adaptif: kalau benar naikkan sedikit kesulitan, kalau salah turunkan
    if (correct) {
      state.test.currentDifficulty = bumpDifficulty(state.test.currentDifficulty, 1);
    } else {
      state.test.currentDifficulty = bumpDifficulty(state.test.currentDifficulty, -1);
    }

    state.test.currentIndex++;

    if (state.test.currentIndex >= state.test.totalQuestions) {
      finishTest();
    } else {
      loadTestQuestion();
    }
  }

  function bumpDifficulty(current, direction) {
    const order = ["dasar", "menengah", "mahir"];
    let idx = order.indexOf(current);
    idx = Math.max(0, Math.min(order.length - 1, idx + direction));
    return order[idx];
  }

  function finishTest() {
    stopTimer(state.test);
    const evalResult = AIEngine.evaluateTestResult(state.test.results);
    state.userLevel = evalResult.level;
    localStorage.setItem("angka_level", evalResult.level);

    // tampilkan halaman hasil tes singkat lalu arahkan ke intro belajar
    showTestResult(evalResult);
  }

  function showTestResult(evalResult) {
    document.getElementById("result-eyebrow").textContent = "— hasil tes kemampuan";
    document.getElementById("result-title").textContent = "Level kamu sudah ditemukan!";
    document.getElementById("result-score").textContent = levelLabel(evalResult.level);
    document.getElementById("result-correct").textContent = `${evalResult.correctCount}/${evalResult.total}`;
    document.getElementById("result-time").textContent = "—";

    const adviceText = {
      dasar: "Kamu berada di level Dasar. Yuk mulai berlatih dari konsep-konsep fundamental — Angka akan menyesuaikan soal supaya kamu makin percaya diri.",
      menengah: "Kamu berada di level Menengah. Kamu sudah cukup kuat di dasar-dasar, sekarang saatnya mengasah variasi soal yang sedikit lebih menantang.",
      mahir: "Kamu berada di level Mahir. Kemampuanmu sudah bagus — Angka akan memberi soal-soal yang menguji pemahamanmu lebih dalam.",
    }[evalResult.level];
    document.getElementById("result-advice-text").textContent = adviceText;

    // sembunyikan tombol "Latihan Lagi" khusus konteks tes, ganti label
    const retryBtn = document.getElementById("result-retry-btn");
    retryBtn.textContent = "Mulai Belajar Sekarang";
    retryBtn.onclick = () => {
      showPage("page-learn-intro");
      renderLearnIntro();
    };

    showPage("page-result");
  }

  testNextBtn.addEventListener("click", submitTestAnswer);
  testAnswerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitTestAnswer();
  });

  document.getElementById("test-open-paper").addEventListener("click", () => openScratchPaper());

  /* =========================================================
     6. MULAI BELAJAR
     ========================================================= */
  const btnGotoLearn = document.getElementById("btn-goto-learn");
  const learnStartBtn = document.getElementById("learn-start-btn");
  const learnTimerEl = document.getElementById("learn-timer");
  const learnProgressLabel = document.getElementById("learn-progress-label");
  const learnProgressFill = document.getElementById("learn-progress-fill");
  const learnEyebrow = document.getElementById("learn-eyebrow");
  const learnQuestionEl = document.getElementById("learn-question");
  const learnAnswerInput = document.getElementById("learn-answer-input");
  const learnNextBtn = document.getElementById("learn-next-btn");

  btnGotoLearn.addEventListener("click", () => {
    showPage("page-learn-intro");
    renderLearnIntro();
  });

  function renderLearnIntro() {
    document.getElementById("intro-level-value").textContent = state.userLevel
      ? levelLabel(state.userLevel)
      : "Belum dites (memakai level Menengah)";
  }

  learnStartBtn.addEventListener("click", () => {
    state.learn.currentIndex = 0;
    state.learn.results = [];
    showPage("page-learn");
    loadLearnQuestion();
    stopTimer(state.learn);
    state.learn.sessionStartTime = Date.now();
    startTimer(state.learn, learnTimerEl);
  });

  function currentLearnDifficulty() {
    return state.userLevel || "menengah";
  }

  function loadLearnQuestion() {
    const idx = state.learn.currentIndex;
    const q = AIEngine.generateQuestion(currentLearnDifficulty());
    state.learn.currentQuestion = q;
    state.learn.questionStartTime = Date.now();

    learnProgressLabel.textContent = `Soal ${idx + 1}/${state.learn.totalQuestions}`;
    learnProgressFill.style.width = `${(idx / state.learn.totalQuestions) * 100}%`;
    learnEyebrow.textContent = q.topicLabel;
    learnQuestionEl.textContent = q.question;
    learnAnswerInput.value = "";
    learnAnswerInput.focus();
  }

  function submitLearnAnswer() {
    const q = state.learn.currentQuestion;
    const userAnswer = learnAnswerInput.value.trim();
    const correct = userAnswer !== "" && AIEngine.checkAnswer(userAnswer, q.answer, q.altAnswers);
    const timeMs = Date.now() - state.learn.questionStartTime;

    state.learn.results.push({
      correct,
      topicLabel: q.topicLabel,
      timeMs,
    });

    state.learn.currentIndex++;

    if (state.learn.currentIndex >= state.learn.totalQuestions) {
      finishLearnSession();
    } else {
      loadLearnQuestion();
    }
  }

  function finishLearnSession() {
    stopTimer(state.learn);
    const totalTimeSec = (Date.now() - state.learn.sessionStartTime) / 1000;
    const evalResult = AIEngine.evaluateSession(state.learn.results, totalTimeSec, currentLearnDifficulty());

    document.getElementById("result-eyebrow").textContent = "— hasil sesi belajar";
    document.getElementById("result-title").textContent =
      evalResult.correctCount === evalResult.total ? "Sempurna!" :
      evalResult.correctCount >= evalResult.total * 0.6 ? "Kerja bagus!" : "Terus berlatih ya!";
    document.getElementById("result-score").textContent = evalResult.finalScore;
    document.getElementById("result-correct").textContent = `${evalResult.correctCount}/${evalResult.total}`;
    document.getElementById("result-time").textContent = formatTime(totalTimeSec);
    document.getElementById("result-advice-text").textContent = evalResult.advice;

    const retryBtn = document.getElementById("result-retry-btn");
    retryBtn.textContent = "Latihan Lagi";
    retryBtn.onclick = () => {
      showPage("page-learn-intro");
      renderLearnIntro();
    };

    showPage("page-result");
  }

  learnNextBtn.addEventListener("click", submitLearnAnswer);
  learnAnswerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitLearnAnswer();
  });

  document.getElementById("learn-open-paper").addEventListener("click", () => openScratchPaper());

  /* =========================================================
     7. CHAT AI
     ========================================================= */
  const btnGotoChat = document.getElementById("btn-goto-chat");
  const chatMessages = document.getElementById("chat-messages");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  btnGotoChat.addEventListener("click", () => {
    showPage("page-chat");
    if (!chatMessages.dataset.initialized) {
      addChatMessage("ai", "Halo! Aku Angka, teman belajar matematikamu. Tanya apa saja — soal yang bikin bingung, konsep yang belum jelas, atau minta dijelaskan ulang. 🙂");
      chatMessages.dataset.initialized = "true";
    }
    chatInput.focus();
  });

  function addChatMessage(sender, text) {
    const el = document.createElement("div");
    el.className = `msg msg-${sender}`;
    el.textContent = text;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return el;
  }

  function showTypingIndicator() {
    const el = document.createElement("div");
    el.className = "msg-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return el;
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMessage("user", text);
    chatInput.value = "";

    const typingEl = showTypingIndicator();
    const delay = 500 + Math.random() * 600;
    setTimeout(() => {
      typingEl.remove();
      const reply = AIEngine.getChatReply(text);
      addChatMessage("ai", reply);
    }, delay);
  });

  /* =========================================================
     8. KERTAS CORET-CORET (scratch paper canvas)
     ========================================================= */
  const scratchOverlay = document.getElementById("scratch-overlay");
  const scratchCanvas = document.getElementById("scratch-canvas");
  const ctx = scratchCanvas.getContext("2d");
  const toolPencil = document.getElementById("tool-pencil");
  const toolEraser = document.getElementById("tool-eraser");
  const toolClear = document.getElementById("tool-clear");
  const scratchCloseBtn = document.getElementById("scratch-close-btn");

  let currentTool = "pencil";
  let drawing = false;
  let lastX = 0, lastY = 0;

  function resizeCanvas() {
    const savedImage = scratchCanvas.width > 0 ? ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height) : null;
    const rect = scratchCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    scratchCanvas.width = rect.width * dpr;
    scratchCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (savedImage) {
      // best-effort restore (not perfectly scaled on resize, acceptable for scratch pad)
      ctx.putImageData(savedImage, 0, 0);
    }
  }

  function openScratchPaper() {
    scratchOverlay.hidden = false;
    requestAnimationFrame(() => {
      resizeCanvas();
    });
  }

  scratchCloseBtn.addEventListener("click", () => {
    scratchOverlay.hidden = true;
  });

  toolPencil.addEventListener("click", () => setTool("pencil"));
  toolEraser.addEventListener("click", () => setTool("eraser"));
  toolClear.addEventListener("click", () => {
    ctx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
  });

  function setTool(tool) {
    currentTool = tool;
    toolPencil.classList.toggle("active", tool === "pencil");
    toolEraser.classList.toggle("active", tool === "eraser");
  }

  // Hanya stylus (pointerType 'pen') yang boleh menggambar.
  // Jari (touch) dan mouse diabaikan sepenuhnya supaya tidak
  // mengganggu scroll/gesture dan mencegah coretan tidak sengaja.
  function isAllowedInput(e) {
    return e.pointerType === "pen";
  }

  function getPos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e) {
    if (!isAllowedInput(e)) return;
    e.preventDefault();
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
  }

  function draw(e) {
    if (!isAllowedInput(e)) return;
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);

    if (currentTool === "pencil") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#1D2B3A";
      ctx.lineWidth = 2.4;
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 26;
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;
  }

  function endDraw(e) {
    if (e && !isAllowedInput(e)) return;
    drawing = false;
  }

  // touch-action di CSS (#scratch-canvas) membiarkan jari tetap bisa
  // scroll/gesture normal; pointer events di bawah hanya bereaksi ke pen.
  scratchCanvas.addEventListener("pointerdown", startDraw);
  scratchCanvas.addEventListener("pointermove", draw);
  window.addEventListener("pointerup", endDraw);
  window.addEventListener("pointercancel", endDraw);

  window.addEventListener("resize", () => {
    if (!scratchOverlay.hidden) resizeCanvas();
  });

  /* =========================================================
     9. INIT
     ========================================================= */
  renderHome();
})();
