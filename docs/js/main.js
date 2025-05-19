document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("toggle-theme");
    const body = document.body;
  
    const savedTheme = localStorage.getItem("theme");
  
    if (savedTheme === "light") {
      body.classList.add("light-theme");
      body.classList.remove("dark-theme");
    } else {
      body.classList.add("dark-theme");
      body.classList.remove("light-theme");
    }
    button.addEventListener("click", () => {
      if (body.classList.contains("light-theme")) {
        
        body.classList.remove("light-theme");
        body.classList.add("dark-theme");
        localStorage.setItem("theme", "dark");
      } else {
        body.classList.remove("dark-theme");
        body.classList.add("light-theme");
        localStorage.setItem("theme", "light");
      }
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.querySelector("nav");
  
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  });
  const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player;
let bullets = [];
let enemies = [];
let score = 0;
let gameInterval;
let isGameOver = false;
const explosionSound = new Audio("sounds/explosion.wav");
const shootSound = new Audio("sounds/shoot.wav");
const bgMusic = new Audio("sounds/bg-music.mp3");
bgMusic.loop = true;

const keys = {
  left: false,
  right: false,
  space: false,
};

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") keys.left = true;
  if (e.code === "ArrowRight") keys.right = true;
  if (e.code === "Space") keys.space = true;
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
  if (e.code === "Space") keys.space = false;
});

function startGame() {
  document.getElementById("gameOver").classList.add("hidden");
  player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 60,
    width: 30,
    height: 40,
    color: "lime",
  };
  bullets = [];
  enemies = [];
  score = 0;
  isGameOver = false;
  bgMusic.play();
  gameInterval = setInterval(updateGame, 1000 / 60);
  requestAnimationFrame(draw);
}

function updateGame() {
  if (keys.left && player.x > 0) player.x -= 5;
  if (keys.right && player.x + player.width < canvas.width) player.x += 5;

  if (keys.space && bullets.length < 5) {
    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 10,
      color: "yellow",
    });
    shootSound.currentTime = 0;
    shootSound.play();
  }

  bullets.forEach((b, i) => {
    b.y -= 7;
    if (b.y < 0) bullets.splice(i, 1);
  });

  enemies.forEach((e, i) => {
    e.y += e.speed;
    if (e.y > canvas.height) enemies.splice(i, 1);

    bullets.forEach((b, j) => {
      if (
        b.x < e.x + e.width &&
        b.x + b.width > e.x &&
        b.y < e.y + e.height &&
        b.y + b.height > e.y
      ) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 100;
        explosionSound.currentTime = 0;
        explosionSound.play();
      }
    });

    if (
      player.x < e.x + e.width &&
      player.x + player.width > e.x &&
      player.y < e.y + e.height &&
      player.y + player.height > e.y
    ) {
      gameOver();
    }
  });

  if (Math.random() < 0.02) {
    enemies.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      width: 30,
      height: 30,
      color: "red",
      speed: 2 + Math.random() * 2,
    });
  }

  document.getElementById("score").innerText = score;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawEntity(player);
  bullets.forEach(drawEntity);
  enemies.forEach(drawEntity);

  if (!isGameOver) requestAnimationFrame(draw);
}

function drawEntity(e) {
  ctx.fillStyle = e.color;
  ctx.fillRect(e.x, e.y, e.width, e.height);
}

function gameOver() {
  clearInterval(gameInterval);
  isGameOver = true;
  document.getElementById("gameOver").classList.remove("hidden");
  bgMusic.pause();
  bgMusic.currentTime = 0;
}
