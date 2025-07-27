const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI Elements
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const gameOverMenu = document.getElementById("gameOverMenu");
const resultText = document.getElementById("resultText");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const muteBtn = document.getElementById("muteButton");

// Sound Effects
const gameOverSound = new Audio("sounds/gameover.wav");
const gameWinSound = new Audio("sounds/gamewin.wav");
const loseBallSound = new Audio("sounds/loseball.wav");
const hitBallSound = new Audio("sounds/hitball.wav");

let isMuted = false;

muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  updateMuteIcon();
});
function updateMuteIcon() {
  muteBtn.textContent = isMuted ? "🔇" : "🔊";
}
updateMuteIcon();

// Game variables
let ballX, ballY, dx, dy;
const ballRadius = 10;
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX;
let rightPressed = false;
let leftPressed = false;
let isPaused = false;

let bricks = [];
let brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let score = 0;
let level = 1;
let totalBricks = 0;
let lives = 3;
let isGameRunning = false;

// Event Listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "▶ Resume" : "⏸ Pause";
  if (!isPaused) draw();
});

startBtn.onclick = () => {
  menu.style.display = "none";
  canvas.style.display = "block";
  pauseBtn.style.display = "inline-block";
  muteBtn.style.display = "inline-block";
  startGame();
};

restartBtn.onclick = () => {
  gameOverMenu.style.display = "none";
  canvas.style.display = "block";
  pauseBtn.style.display = "inline-block";
  muteBtn.style.display = "inline-block";
  level = 1;
  brickRowCount = 3;
  startGame();
};

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  else if (e.key.toLowerCase() === "p") {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶ Resume" : "⏸ Pause";
    if (!isPaused) draw();
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function createBricks() {
  bricks = [];
  totalBricks = 0;
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
      totalBricks++;
    }
  }
}

function startGame() {
  resetGame();
  isGameRunning = true;
  draw();
}

function resetGame() {
  ballX = canvas.width / 2;
  ballY = canvas.height - 30;
  dx = 2 + level * 0.5;
  dy = -2 - level * 0.5;
  paddleX = (canvas.width - paddleWidth) / 2;
  score = 0;
  lives = 3;
  createBricks();
}

function nextLevel() {
  level++;
  brickRowCount++;
  if (!isMuted) gameWinSound.play();
  resetGame();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#00f";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = `hsl(${(r / brickRowCount) * 360}, 80%, 60%)`;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          ballX > b.x &&
          ballX < b.x + brickWidth &&
          ballY > b.y &&
          ballY < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === totalBricks) {
            setTimeout(() => {
              alert(`🎉 Level ${level} Complete!`);
              nextLevel();
            }, 100);
          }
        }
      }
    }
  }
}

function drawLives() {
  ctx.font = "18px Arial";
  ctx.fillStyle = "#f66";
  const heart = "❤️";
  const totalWidth = lives * 30;
  const startX = canvas.width / 2 - totalWidth / 2;
  for (let i = 0; i < lives; i++) {
    ctx.fillText(heart, startX + i * 30, 20);
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 8, 20);
  ctx.fillText("Level: " + level, canvas.width - 100, 20);
  drawLives();
}

function draw() {
  if (!isGameRunning || isPaused) {
    if (isPaused) {
      ctx.font = "24px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText("⏸ Paused", canvas.width / 2 - 50, canvas.height / 2);
    }
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  collisionDetection();

  // Ball bouncing logic on left/right walls
  if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
    dx = -dx;
    if (!isMuted) hitBallSound.play();
  }

  // Ball bouncing logic on top wall
  if (ballY + dy < ballRadius) {
    dy = -dy;
    if (!isMuted) hitBallSound.play();
  }
  // Ball bouncing logic on paddle or lose life
  else if (ballY + dy > canvas.height - ballRadius) {
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      dy = -dy;
      if (!isMuted) hitBallSound.play();
    } else {
      if (!isMuted) loseBallSound.play();
      lives--;
      if (lives <= 0) {
        endGame(false);
        return;
      } else {
        ballX = canvas.width / 2;
        ballY = canvas.height - 30;
        dx = 2 + level * 0.5;
        dy = -2 - level * 0.5;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  ballX += dx;
  ballY += dy;

  requestAnimationFrame(draw);
}

function endGame(won) {
  isGameRunning = false;
  canvas.style.display = "none";
  pauseBtn.style.display = "none";
  muteBtn.style.display = "none";
  gameOverMenu.style.display = "block";
  resultText.textContent = won ? "🎉 You Win All Levels!" : "💀 Game Over!";
  if (!isMuted) {
    if (won) gameWinSound.play();
    else gameOverSound.play();
  }
}
