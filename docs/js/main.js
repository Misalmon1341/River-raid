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


// LÓGICA PRINCIPAL DEL JUEGO
function iniciarJuego() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const playerImg = document.getElementById('playerSprite');
  const enemyImg = document.getElementById('enemySprite');
  const bulletImg = document.getElementById('bulletSprite');
  const explosionImg = document.getElementById('explosionSprite');

  let keys = {};
  let bullets = [];
  let enemies = [];
  let explosions = [];
  let score = 0;
  let gameOver = false;

  const player = {
    x: canvas.width / 2 - 10,
    y: canvas.height - 60,
    width: 10,
    height: 30,
    speed: 5,
  };

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
    e.preventDefault(); // <-- Previene el scroll
  }
  keys[e.code] = true;
});
 document.addEventListener('keyup', (e) => keys[e.code] = false);

  function shoot() {
    bullets.push({ x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 10 });
    playSound('shoot');
  }

  function spawnEnemy() {
    const x = Math.random() * (canvas.width - 10);
    enemies.push({ x, y: -30, width: 10, height: 30, speed: 2 + Math.random() * 2 });
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

    // Movimiento
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

    // Actualizar balas
    bullets.forEach(b => b.y -= 5);
    bullets = bullets.filter(b => b.y > 0);

    // Actualizar enemigos
    enemies.forEach(e => e.y += e.speed);
    enemies = enemies.filter(e => e.y < canvas.height);

    // Colisiones
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
          createExplosion(e.x - 8, e.y - 8);
          break;
        }
      }
    }

    // Spawnear enemigos aleatorios
    if (Math.random() < 0.03) {
      spawnEnemy();
    }

    // Actualizar explosiones
    explosions.forEach(ex => {
      ex.timer++;
      if (ex.timer % 5 === 0) ex.frame++;
    });
    explosions = explosions.filter(ex => ex.frame < 4);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibuja jugador
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Dibuja balas
  ctx.fillStyle = 'yellow';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

  // Dibuja enemigos
  ctx.fillStyle = 'red';
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));

  // Dibuja explosiones
  ctx.fillStyle = 'orange';
  explosions.forEach(ex => ctx.beginPath() || ctx.arc(ex.x, ex.y, 10, 0, 2 * Math.PI) || ctx.fill());

  // Actualiza puntuación
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

