// PINDAH HALAMAN




// TIMER

let seconds = 0;

setInterval(() => {

  if (document.getElementById("lesson").style.display == "block") {

    seconds++;

    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;

    document.getElementById("timer").innerText =
      String(min).padStart(2, "0") + ":" +
      String(sec).padStart(2, "0");
  }

}, 1000);



// KERTAS CORETAN




function closePaper() {
  document.getElementById("paper").style.display = "none";
}



// FUNGSI GAMBAR

let mode = "pen";

function pen() {
  mode = "pen";
}


function eraser() {
  mode = "eraser";
}



function setupCanvas(id) {

  let canvas = document.getElementById(id);
  let ctx = canvas.getContext("2d");


  function resize() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

  resize();

  window.addEventListener("resize", resize);


  let drawing = false;


  canvas.addEventListener("pointerdown", (e) => {

    drawing = true;

    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);

  });


  canvas.addEventListener("pointermove", (e) => {

    if (!drawing) return;


    if (mode == "pen") {

      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 3;

    } else {

      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20;

    }


    ctx.lineCap = "round";

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

  });


  canvas.addEventListener("pointerup", () => {

    drawing = false;

  });

}


let answerReady = false;
let paperReady = false;


// saat mulai belajar
function startLesson() {
  document.getElementById("home").style.display = "none";
  document.getElementById("lesson").style.display = "block";

  if (!answerReady) {
    setupCanvas("answerCanvas");
    answerReady = true;
  }
}


// saat buka kertas
function openPaper() {
  document.getElementById("paper").style.display = "block";

  if (!paperReady) {
    setupCanvas("canvas");
    paperReady = true;
  }
}
let currentQuestion = 1;


let questions = [
  {
    text: "Hitung nilai x:",
    question: "2x + 5 = 15"
  },
  {
    text: "Hitung nilai y:",
    question: "3y + 4 = 19"
  },
  {
    text: "Hitung nilai a:",
    question: "5a - 10 = 20"
  }
];


function nextQuestion() {

  currentQuestion++;


  if (currentQuestion > questions.length) {
    alert("Sesi selesai!");
    return;
  }


  document.getElementById("questionNumber").innerText =
    "Soal " + currentQuestion + "/" + questions.length;


  document.getElementById("questionText").innerText =
    questions[currentQuestion - 1].text;


  document.getElementById("question").innerText =
    questions[currentQuestion - 1].question;


  // hapus jawaban lama
  let canvas = document.getElementById("answerCanvas");
  let ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

}
