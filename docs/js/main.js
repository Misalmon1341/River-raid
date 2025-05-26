document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("toggle-theme");
  const body = document.body;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    body.classList.add("light-theme");
  } else {
    body.classList.add("dark-theme");
  }

  button.addEventListener("click", () => {
    body.classList.toggle("light-theme");
    body.classList.toggle("dark-theme");
    localStorage.setItem("theme", body.classList.contains("light-theme") ? "light" : "dark");
  });

  // MENÚ RESPONSIVE
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector("nav");
  menuToggle.addEventListener("click", () => nav.classList.toggle("open"));

  // BOTÓN JUGAR
  const playButton = document.getElementById("play-button");
  const jugarSection = document.getElementById("jugar");
  playButton.addEventListener("click", () => {
    jugarSection.style.display = "block";
    playButton.style.display = "none";
    iniciarJuego(); // <-- Arranca el juego
  });
});

// Variables globales
let player = { x: 150, y: 400, width: 32, height: 32, speed: 4 };
let bullets = [];
let enemies = [];
let explosions = [];
let score = 0;
let gameOver = false;
let keys = {};

function iniciarJuego() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const playerImg = document.getElementById('playerSprite');
  const enemyImg = document.getElementById('enemySprite');
  const bulletImg = document.getElementById('bulletSprite');
  const explosionImg = document.getElementById('explosionSprite');

  // Esperar que todas las imágenes estén cargadas
  const images = [playerImg, enemyImg, bulletImg, explosionImg];
  let loadedCount = 0;

  images.forEach(img => {
    if (img.complete) {
      loadedCount++;
      if (loadedCount === images.length) startGame();
    } else {
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) startGame();
      };
    }
  });

  function startGame() {
    // Previene el scroll con espacio o flechas
    document.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code) && e.target === document.body) {
        e.preventDefault();
      }
      keys[e.code] = true;
    });

    document.addEventListener('keyup', (e) => {
      keys[e.code] = false;
    });

    function shoot() {
      bullets.push({ x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 10 });
      playSound('shoot');
    }

    function spawnEnemy() {
      const x = Math.random() * (canvas.width - 32);
      enemies.push({ x, y: -32, width: 32, height: 32, speed: 2 + Math.random() * 2 });
    }

    function playSound(type) {
      const audio = new Audio(`sounds/${type}.wav`);
      audio.volume = 0.5;
      audio.play();
    }

    function createExplosion(x, y) {
      explosions.push({ x, y, frame: 0, timer: 0 });
    }

    function update() {
      if (gameOver) return;

      // Movimiento del jugador
      if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
      if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

      if (keys['Space']) {
        if (!keys['_shot']) {
          shoot();
          keys['_shot'] = true;
        }
      } else {
        keys['_shot'] = false;
      }

      bullets.forEach(b => b.y -= 5);
      bullets = bullets.filter(b => b.y > 0);

      enemies.forEach(e => e.y += e.speed);
      enemies = enemies.filter(e => e.y < canvas.height);

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];

        // Colisión con jugador
        if (
          e.x < player.x + player.width &&
          e.x + e.width > player.x &&
          e.y < player.y + player.height &&
          e.y + e.height > player.y
        ) {
          gameOver = true;
          alert('¡Has perdido! Puntuación: ' + score);
          location.reload();
          return;
        }

        // Colisión con bala
        for (let j = bullets.length - 1; j >= 0; j--) {
          const b = bullets[j];
          if (
            b.x < e.x + e.width &&
            b.x + b.width > e.x &&
            b.y < e.y + e.height &&
            b.y + b.height > e.y
          ) {
            enemies.splice(i, 1);
            bullets.splice(j, 1);
            score++;
            playSound('explosion');
            createExplosion(e.x, e.y);
            break;
          }
        }
      }

      // Spawneo aleatorio
      if (Math.random() < 0.03) {
        spawnEnemy();
      }

      explosions.forEach(ex => {
        ex.timer++;
        if (ex.timer % 5 === 0) ex.frame++;
      });
      explosions = explosions.filter(ex => ex.frame < 4);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Jugador
      ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

      // Balas
      bullets.forEach(b => {
        ctx.drawImage(bulletImg, b.x, b.y, 8, 16);
      });

      // Enemigos
      enemies.forEach(e => {
        ctx.drawImage(enemyImg, e.x, e.y, e.width, e.height);
      });

      // Explosiones (sprite animado horizontal de 4 frames de 32x32)
      explosions.forEach(ex => {
        ctx.drawImage(explosionImg, ex.frame * 32, 0, 32, 32, ex.x, ex.y, 32, 32);
      });

      document.getElementById('score').textContent = 'Puntuación: ' + score;
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    // Música de fondo
    const music = new Audio('sounds/bg-music.mp3');
    music.loop = true;
    music.volume = 0.3;
    music.play();

    loop();
  }
}