// TIMER
let seconds = 0;

setInterval(() => {
  seconds++;

  let min = Math.floor(seconds / 60);
  let sec = seconds % 60;

  document.getElementById("timer").innerText =
    String(min).padStart(2, "0") + ":" +
    String(sec).padStart(2, "0");

}, 1000);


// BUKA KERTAS
function openPaper() {
  document.getElementById("paper").style.display = "block";
}


// TUTUP KERTAS
function closePaper() {
  document.getElementById("paper").style.display = "none";
}


// CANVAS CORETAN
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 60;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


let drawing = false;


canvas.addEventListener("pointerdown", (e) => {
  drawing = true;

  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});


canvas.addEventListener("pointermove", (e) => {

  if (!drawing) return;

  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();

});


canvas.addEventListener("pointerup", () => {
  drawing = false;
});
