const pages = {
  home: document.getElementById("homePage"),
  rule: document.getElementById("rulePage"),
  rank: document.getElementById("rankPage"),
  game: document.getElementById("gamePage"),
  end: document.getElementById("endPage")
};

const startBtn = document.getElementById("startBtn");
const ruleBtn = document.getElementById("ruleBtn");
const rankBtn = document.getElementById("rankBtn");
const restartBtn = document.getElementById("restartBtn");
const backHomeBtns = document.querySelectorAll(".backHomeBtn");

const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const lifeEl = document.getElementById("life");
const finalScoreEl = document.getElementById("finalScore");
const rankBestScoreEl = document.getElementById("rankBestScore");
const gradeEl = document.getElementById("grade");
const endMessageEl = document.getElementById("endMessage");
const comboText = document.getElementById("comboText");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const pauseBtn = document.getElementById("pauseBtn");

let score = 0;
let timeLeft = 60;
let life = 3;
let playerX = 240;
let keys = {};
let isPaused = false;
let doubleScore = false;

let gameTimer = null;
let spawnTimer = null;
let loopTimer = null;
let doubleTimer = null;

const foods = ["🍔", "🍕", "🍣", "🍟", "🍩", "🥤", "🌮", "🍜", "🥪"];
const powerItems = ["⭐", "⏰"];

function showPage(name) {
  Object.values(pages).forEach(page => page.classList.add("hidden"));
  pages[name].classList.remove("hidden");

  if (name === "rank") {
    rankBestScoreEl.textContent = localStorage.getItem("easyfood_best") || 0;
  }
}

function resetGame() {
  clearAllTimers();
  score = 0;
  timeLeft = 60;
  life = 3;
  isPaused = false;
  doubleScore = false;
  playerX = Math.max(0, gameArea.clientWidth / 2 - 33);

  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  lifeEl.textContent = "❤️".repeat(life);
  pauseBtn.textContent = "暫停";
  comboText.classList.add("hidden");

  gameArea.querySelectorAll(".item").forEach(item => item.remove());
  player.style.left = playerX + "px";
}

function startGame() {
  resetGame();
  showPage("game");

  gameTimer = setInterval(() => {
    if (isPaused) return;
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);

  spawnTimer = setInterval(() => {
    if (!isPaused) createItem();
  }, 560);

  loopTimer = setInterval(() => {
    if (isPaused) return;
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) movePlayer(-20);
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) movePlayer(20);
    moveItems();
  }, 30);
}

function clearAllTimers() {
  clearInterval(gameTimer);
  clearInterval(spawnTimer);
  clearInterval(loopTimer);
  clearTimeout(doubleTimer);
}

function movePlayer(amount) {
  const maxX = gameArea.clientWidth - player.clientWidth;
  playerX += amount;
  if (playerX < 0) playerX = 0;
  if (playerX > maxX) playerX = maxX;
  player.style.left = playerX + "px";
}

function createItem() {
  const item = document.createElement("div");
  item.className = "item";

  const random = Math.random();

  if (random < 0.18) {
    item.dataset.type = "bad";
    item.textContent = "💣";
  } else if (random < 0.30) {
    item.dataset.type = "power";
    item.textContent = powerItems[Math.floor(Math.random() * powerItems.length)];
  } else {
    item.dataset.type = "food";
    item.textContent = foods[Math.floor(Math.random() * foods.length)];
  }

  item.style.left = Math.random() * (gameArea.clientWidth - 58) + "px";
  item.style.top = "-60px";
  item.dataset.speed = 3.2 + Math.random() * 3.5;
  gameArea.appendChild(item);
}

function moveItems() {
  const items = gameArea.querySelectorAll(".item");
  const playerRect = player.getBoundingClientRect();

  items.forEach(item => {
    const top = Number(item.style.top.replace("px", ""));
    item.style.top = top + Number(item.dataset.speed) + "px";

    if (isColliding(playerRect, item.getBoundingClientRect())) {
      handleCatch(item);
      item.remove();
    }

    if (top > gameArea.clientHeight + 70) {
      item.remove();
    }
  });
}

function handleCatch(item) {
  if (item.dataset.type === "food") {
    score += doubleScore ? 20 : 10;
  }

  if (item.dataset.type === "bad") {
    life--;
    lifeEl.textContent = "❤️".repeat(life);
    if (life <= 0) endGame();
  }

  if (item.dataset.type === "power") {
    if (item.textContent === "⭐") {
      activateDoubleScore();
    }

    if (item.textContent === "⏰") {
      timeLeft += 5;
      timeEl.textContent = timeLeft;
    }
  }

  scoreEl.textContent = score;
}

function activateDoubleScore() {
  doubleScore = true;
  comboText.classList.remove("hidden");
  clearTimeout(doubleTimer);
  doubleTimer = setTimeout(() => {
    doubleScore = false;
    comboText.classList.add("hidden");
  }, 6000);
}

function isColliding(a, b) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function endGame() {
  clearAllTimers();

  const oldBest = Number(localStorage.getItem("easyfood_best") || 0);
  if (score > oldBest) {
    localStorage.setItem("easyfood_best", score);
    endMessageEl.textContent = "新紀錄！你是 EasyFood 外送王 👑";
  } else {
    endMessageEl.textContent = "再玩一次，下一局一定更高分！";
  }

  finalScoreEl.textContent = score;
  gradeEl.textContent = getGrade(score);
  showPage("end");
}

function getGrade(score) {
  if (score >= 500) return "S";
  if (score >= 350) return "A";
  if (score >= 200) return "B";
  if (score >= 100) return "C";
  return "D";
}

function togglePause() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "繼續" : "暫停";
}

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function holdButton(btn, key) {
  btn.addEventListener("mousedown", () => keys[key] = true);
  btn.addEventListener("mouseup", () => keys[key] = false);
  btn.addEventListener("mouseleave", () => keys[key] = false);
  btn.addEventListener("touchstart", e => {
    e.preventDefault();
    keys[key] = true;
  });
  btn.addEventListener("touchend", () => keys[key] = false);
}

holdButton(leftBtn, "ArrowLeft");
holdButton(rightBtn, "ArrowRight");

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
ruleBtn.addEventListener("click", () => showPage("rule"));
rankBtn.addEventListener("click", () => showPage("rank"));
pauseBtn.addEventListener("click", togglePause);
backHomeBtns.forEach(btn => btn.addEventListener("click", () => {
  clearAllTimers();
  showPage("home");
}));
