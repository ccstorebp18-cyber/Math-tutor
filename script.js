alert("JavaScript aktif");

// =======================
// PINDAH HALAMAN
// =======================

function hideAll() {
  document.querySelectorAll(".page").forEach(e => {
    e.classList.add("hidden");
  });
}


function goHome() {
  hideAll();
  document.getElementById("home").classList.remove("hidden");
}


function showChat() {
  hideAll();
  document.getElementById("chat").classList.remove("hidden");
}


// =======================
// TES KEMAMPUAN
// =======================

let testNumber = 0;

let testQuestions = [
  "Berapa hasil dari 5 + 7?",
  "Hitung luas persegi dengan sisi 8 cm",
  "Jika x + 5 = 12, berapa nilai x?"
];


function startTest() {
  hideAll();
  document.getElementById("test").classList.remove("hidden");

  testNumber = 0;
  showTest();
}


function showTest() {
  document.getElementById("testQuestion").innerText =
  testQuestions[testNumber];
}


function nextTest() {

  testNumber++;

  if(testNumber >= testQuestions.length){

    alert("Tes selesai!");
    startLesson();

    return;
  }

  showTest();
}




// =======================
// BELAJAR
// =======================


let questions = [
 {
  text:"Hitung nilai x:",
  q:"2x + 5 = 15"
 },
 {
  text:"Hitung nilai y:",
  q:"3y + 4 = 19"
 },
 {
  text:"Hitung nilai a:",
  q:"5a - 10 = 20"
 }
];


let current = 0;


function startLesson(){

 hideAll();

 document.getElementById("lesson")
 .classList.remove("hidden");


 current = 0;

 showQuestion();

 startTimer();

}



function showQuestion(){

 document.getElementById("number")
 .innerText =
 "Soal " + (current+1) + "/" + questions.length;


 document.getElementById("questionText")
 .innerText =
 questions[current].text;


 document.getElementById("question")
 .innerText =
 questions[current].q;


 clearCanvas(answerCanvas);

}



function nextQuestion(){

 current++;


 if(current >= questions.length){

  showResult();

  return;

 }


 showQuestion();

}




// =======================
// TIMER
// =======================


let seconds = 0;
let timer;


function startTimer(){

 clearInterval(timer);

 seconds = 0;


 timer=setInterval(()=>{

 seconds++;


 let m=Math
