const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  healthFill: document.getElementById("healthFill"),
  healthText: document.getElementById("healthText"),
  coinsText: document.getElementById("coinsText"),
  crashesText: document.getElementById("crashesText"),
  vaultItems: document.getElementById("vaultItems"),
  startScreen: document.getElementById("startScreen"),
  endScreen: document.getElementById("endScreen"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton"),
  resultTitle: document.getElementById("resultTitle"),
  resultHeading: document.getElementById("resultHeading"),
  resultCrashes: document.getElementById("resultCrashes"),
  resultTreasures: document.getElementById("resultTreasures"),
  resultCoins: document.getElementById("resultCoins"),
  resultHealth: document.getElementById("resultHealth"),
  celebrationLayer: document.getElementById("celebrationLayer"),
  difficultyCards: [...document.querySelectorAll(".difficulty-card")],
};

const W = canvas.width;
const H = canvas.height;
const roadWidth = 78;
const halfRoad = roadWidth / 2;

const difficulties = {
  easy: { label: "低级", carCount: 12, trafficSpeed: 54, playerSpeed: 128 },
  medium: { label: "中级", carCount: 19, trafficSpeed: 76, playerSpeed: 134 },
  hard: { label: "高级", carCount: 28, trafficSpeed: 98, playerSpeed: 140 },
};

const roadXs = [145, 355, 580, 820, 1060];
const roadYs = [118, 292, 508, 650];
const startPoint = { x: 145, y: 650 };
const finishPoint = { x: 1160, y: 292 };
const roads = [
  ...roadYs.map((y) => ({ x: 52, y: y - halfRoad, w: 1176, h: roadWidth })),
  ...roadXs.map((x) => ({ x: x - halfRoad, y: 64, w: roadWidth, h: 636 })),
];

const buildings = [
  { x: 210, y: 32, w: 112, h: 70, name: "学校", kind: "school", color: "#ffb84d", roof: "#e45f5f" },
  { x: 414, y: 32, w: 118, h: 70, name: "医院", kind: "hospital", color: "#ffffff", roof: "#f25f5c" },
  { x: 650, y: 32, w: 120, h: 70, name: "图书馆", kind: "library", color: "#f5d36f", roof: "#8f6a3d" },
  { x: 900, y: 32, w: 110, h: 70, name: "警局", kind: "police", color: "#9bd4ff", roof: "#2d65b3" },
  { x: 28, y: 190, w: 86, h: 72, name: "公交站", kind: "bus", color: "#d8f6ff", roof: "#3b82f6" },
  { x: 206, y: 190, w: 116, h: 74, name: "消防站", kind: "fire", color: "#ff8b73", roof: "#b91c1c" },
  { x: 414, y: 190, w: 118, h: 74, name: "市政厅", kind: "cityHall", color: "#e7e0cb", roof: "#7f8c8d" },
  { x: 650, y: 188, w: 120, h: 76, name: "商场", kind: "mall", color: "#ffd1e7", roof: "#db2777" },
  { x: 898, y: 188, w: 116, h: 76, name: "市集", kind: "market", color: "#c8f7c5", roof: "#16a34a" },
  { x: 1120, y: 190, w: 108, h: 72, name: "加油站", kind: "gas", color: "#fff3a6", roof: "#f97316" },
  { x: 24, y: 382, w: 90, h: 82, name: "公园", kind: "park", color: "#a7e889", roof: "#3fa34d" },
  { x: 206, y: 380, w: 116, h: 84, name: "博物馆", kind: "museum", color: "#dbc7ff", roof: "#7c3aed" },
  { x: 414, y: 382, w: 118, h: 82, name: "火车站", kind: "train", color: "#d1e8ff", roof: "#475569" },
  { x: 650, y: 382, w: 120, h: 82, name: "电影院", kind: "cinema", color: "#fde68a", roof: "#111827" },
  { x: 898, y: 382, w: 116, h: 82, name: "邮局", kind: "post", color: "#f9df6d", roof: "#0f766e" },
  { x: 1120, y: 382, w: 108, h: 82, name: "诊所", kind: "clinic", color: "#d9f99d", roof: "#ef4444" },
  { x: 205, y: 570, w: 116, h: 60, name: "面包店", kind: "bakery", color: "#fed7aa", roof: "#c2410c" },
  { x: 414, y: 570, w: 118, h: 60, name: "游泳馆", kind: "pool", color: "#bae6fd", roof: "#0284c7" },
  { x: 650, y: 570, w: 120, h: 60, name: "音乐厅", kind: "music", color: "#e9d5ff", roof: "#9333ea" },
  { x: 898, y: 570, w: 116, h: 60, name: "花店", kind: "flower", color: "#bbf7d0", roof: "#ec4899" },
];

const treasureCatalog = [
  { name: "星星", icon: "星", color: "#ffd348" },
  { name: "钻石", icon: "钻", color: "#7dd3fc" },
  { name: "奖杯", icon: "奖", color: "#fbbf24" },
  { name: "彩球", icon: "球", color: "#fb7185" },
  { name: "书本", icon: "书", color: "#60a5fa" },
  { name: "徽章", icon: "章", color: "#a78bfa" },
  { name: "花朵", icon: "花", color: "#f472b6" },
  { name: "钥匙", icon: "钥", color: "#facc15" },
];

let selectedDifficulty = "easy";
let state = "start";
let lastTime = 0;
let player;
let traffic = [];
let collectibles = [];
let fireworks = [];
let finishPulse = 0;
let stats;
let pointer = { x: startPoint.x, y: startPoint.y, valid: true };
let lastRoadTarget = { x: startPoint.x, y: startPoint.y };

function resetGame() {
  const config = difficulties[selectedDifficulty];
  state = "running";
  player = {
    x: startPoint.x,
    y: startPoint.y,
    r: 22,
    heading: 0,
    health: 100,
    speed: config.playerSpeed,
    invincible: 0,
  };
  pointer = { x: player.x + 80, y: player.y, valid: true };
  lastRoadTarget = { x: pointer.x, y: pointer.y };
  stats = { coins: 0, crashes: 0, treasures: 0, vault: [] };
  traffic = createTraffic(config);
  collectibles = createCollectibles();
  fireworks = [];
  finishPulse = 0;
  ui.startScreen.classList.add("hidden");
  ui.endScreen.classList.add("hidden");
  updateHud();
}

function createTraffic(config) {
  const routes = [
    ...roadYs.map((y) => ({ type: "h", y, min: 68, max: 1212 })),
    ...roadXs.map((x) => ({ type: "v", x, min: 80, max: 688 })),
  ];
  const colors = ["#ef4444", "#3b82f6", "#16a34a", "#f97316", "#8b5cf6", "#06b6d4"];
  const cars = [];
  for (let i = 0; i < config.carCount; i += 1) {
    const route = routes[i % routes.length];
    const dir = i % 2 === 0 ? 1 : -1;
    const speed = config.trafficSpeed * (0.82 + ((i * 13) % 34) / 100);
    const span = route.max - route.min;
    const offset = ((i * 151) % span) + route.min;
    const car = {
      route,
      dir,
      speed,
      x: route.type === "h" ? offset : route.x + (dir > 0 ? 16 : -16),
      y: route.type === "h" ? route.y + (dir > 0 ? -16 : 16) : offset,
      w: route.type === "h" ? 42 : 28,
      h: route.type === "h" ? 26 : 46,
      color: colors[i % colors.length],
      hitCooldown: 0,
    };
    keepTrafficAwayFromSafeZones(car);
    cars.push(car);
  }
  return cars;
}

function keepTrafficAwayFromSafeZones(car) {
  const safeZones = [startPoint, finishPoint];
  for (let guard = 0; guard < 5; guard += 1) {
    const tooClose = safeZones.some((zone) => Math.hypot(car.x - zone.x, car.y - zone.y) < 150);
    if (!tooClose) return;
    if (car.route.type === "h") {
      car.x += 210;
      if (car.x > car.route.max) car.x = car.route.min + (car.x - car.route.max);
    } else {
      car.y += 210;
      if (car.y > car.route.max) car.y = car.route.min + (car.y - car.route.max);
    }
  }
}

function createCollectibles() {
  const spots = [
    { x: 355, y: 118 },
    { x: 580, y: 118 },
    { x: 1060, y: 118 },
    { x: 145, y: 292 },
    { x: 580, y: 292 },
    { x: 820, y: 292 },
    { x: 355, y: 508 },
    { x: 820, y: 508 },
    { x: 1060, y: 508 },
    { x: 580, y: 650 },
    { x: 820, y: 650 },
    { x: 1060, y: 650 },
    { x: 145, y: 508 },
    { x: 355, y: 650 },
    { x: 1060, y: 292 },
  ];
  return spots.map((spot, index) => {
    if (index === 2 || index === 8 || index === 13) {
      return {
        ...spot,
        type: "chest",
        value: [10, 30, 50][index % 3],
        collected: false,
      };
    }
    if (index % 3 === 0) {
      return { ...spot, type: "treasure", item: treasureCatalog[index % treasureCatalog.length], collected: false };
    }
    return { ...spot, type: "coin", value: 1 + (index % 2), collected: false };
  });
}

function canvasPointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H,
  };
}

function isOnRoad(x, y, radius = 0) {
  return roads.some(
    (road) =>
      x >= road.x + radius &&
      x <= road.x + road.w - radius &&
      y >= road.y + radius &&
      y <= road.y + road.h - radius,
  );
}

function handlePointerMove(event) {
  const point = canvasPointFromEvent(event);
  pointer = { ...point, valid: isOnRoad(point.x, point.y, 8) };
  if (pointer.valid) {
    lastRoadTarget = point;
  }
}

function handleTouchMove(event) {
  if (event.touches.length > 0) {
    handlePointerMove(event.touches[0]);
    event.preventDefault();
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function rectCircleCollide(rect, circle) {
  const cx = Math.max(rect.x - rect.w / 2, Math.min(circle.x, rect.x + rect.w / 2));
  const cy = Math.max(rect.y - rect.h / 2, Math.min(circle.y, rect.y + rect.h / 2));
  return Math.hypot(circle.x - cx, circle.y - cy) < circle.r;
}

function update(dt) {
  if (state !== "running") {
    updateFireworks(dt);
    return;
  }

  finishPulse += dt;
  player.invincible = Math.max(0, player.invincible - dt);
  movePlayer(dt);
  moveTraffic(dt);
  checkCollisions();
  checkCollectibles();

  if (distance(player, finishPoint) < 42) {
    finishGame(true);
  }
}

function movePlayer(dt) {
  const target = lastRoadTarget;
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const len = Math.hypot(dx, dy);
  let vx = Math.cos(player.heading);
  let vy = Math.sin(player.heading);

  if (len > 8) {
    vx = dx / len;
    vy = dy / len;
    player.heading = Math.atan2(vy, vx);
  }

  const step = player.speed * dt;
  const next = { x: player.x + vx * step, y: player.y + vy * step };
  if (isOnRoad(next.x, next.y, player.r * 0.72)) {
    player.x = next.x;
    player.y = next.y;
    return;
  }

  const nextX = { x: player.x + vx * step, y: player.y };
  const nextY = { x: player.x, y: player.y + vy * step };
  if (isOnRoad(nextX.x, nextX.y, player.r * 0.72)) {
    player.x = nextX.x;
  }
  if (isOnRoad(nextY.x, nextY.y, player.r * 0.72)) {
    player.y = nextY.y;
  }
}

function moveTraffic(dt) {
  for (const car of traffic) {
    car.hitCooldown = Math.max(0, car.hitCooldown - dt);
    if (car.route.type === "h") {
      car.x += car.dir * car.speed * dt;
      if (car.dir > 0 && car.x > car.route.max) car.x = car.route.min;
      if (car.dir < 0 && car.x < car.route.min) car.x = car.route.max;
    } else {
      car.y += car.dir * car.speed * dt;
      if (car.dir > 0 && car.y > car.route.max) car.y = car.route.min;
      if (car.dir < 0 && car.y < car.route.min) car.y = car.route.max;
    }
  }
}

function checkCollisions() {
  for (const car of traffic) {
    if (car.hitCooldown > 0 || player.invincible > 0) continue;
    if (rectCircleCollide(car, player)) {
      car.hitCooldown = 1.2;
      player.invincible = 0.7;
      player.health = Math.max(0, player.health - 10);
      stats.crashes += 1;
      updateHud();
      if (player.health <= 0 || stats.crashes >= 10) {
        finishGame(false);
      }
    }
  }
}

function checkCollectibles() {
  for (const item of collectibles) {
    if (item.collected || distance(player, item) > 33) continue;
    item.collected = true;
    if (item.type === "coin") {
      stats.coins += item.value;
    } else if (item.type === "chest") {
      player.health = Math.min(100, player.health + item.value);
      stats.treasures += 1;
      stats.vault.push({ icon: `+${item.value}`, color: "#86efac" });
    } else {
      stats.treasures += 1;
      stats.vault.push(item.item);
    }
    updateHud();
  }
}

function finishGame(won) {
  state = "ended";
  ui.resultTitle.textContent = won ? "恭喜完成" : "游戏结束";
  ui.resultHeading.textContent = won ? "安全到达终点" : "小汽车需要修理啦";
  ui.resultCrashes.textContent = stats.crashes;
  ui.resultTreasures.textContent = stats.treasures;
  ui.resultCoins.textContent = stats.coins;
  ui.resultHealth.textContent = `${Math.round(player.health)}%`;
  ui.endScreen.classList.remove("hidden");
  launchCelebration();
  spawnFireworks();
}

function launchCelebration() {
  const colors = ["#ffd348", "#fb7185", "#60a5fa", "#34d399", "#f97316", "#a78bfa"];
  const centers = [
    { x: 22, y: 28 },
    { x: 78, y: 26 },
    { x: 18, y: 68 },
    { x: 82, y: 66 },
    { x: 50, y: 18 },
  ];
  ui.celebrationLayer.innerHTML = "";
  centers.forEach((center, burstIndex) => {
    for (let i = 0; i < 24; i += 1) {
      const angle = (Math.PI * 2 * i) / 24;
      const distance = 72 + ((i * 19 + burstIndex * 11) % 86);
      const spark = document.createElement("span");
      spark.className = "spark";
      spark.style.left = `${center.x}%`;
      spark.style.top = `${center.y}%`;
      spark.style.setProperty("--spark-color", colors[(i + burstIndex) % colors.length]);
      spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
      spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
      spark.style.setProperty("--spark-delay", `${burstIndex * 120 + (i % 5) * 24}ms`);
      ui.celebrationLayer.appendChild(spark);
    }
  });
}

function updateHud() {
  const health = Math.round(player.health);
  ui.healthText.textContent = `${health}%`;
  ui.healthFill.style.width = `${health}%`;
  ui.healthFill.style.background =
    health > 55 ? "linear-gradient(90deg, #38bdf8, #37bf6e)" : health > 25 ? "#ffd348" : "#f25f5c";
  ui.coinsText.textContent = stats.coins;
  ui.crashesText.textContent = stats.crashes;
  ui.vaultItems.innerHTML = "";
  stats.vault.slice(-15).forEach((item) => {
    const cell = document.createElement("div");
    cell.className = "vault-item";
    cell.textContent = item.icon;
    cell.style.background = item.color;
    ui.vaultItems.appendChild(cell);
  });
}

function spawnFireworks() {
  fireworks = [];
  for (let burst = 0; burst < 8; burst += 1) {
    const cx = 230 + ((burst * 131) % 820);
    const cy = 110 + ((burst * 67) % 280);
    const color = ["#ffd348", "#fb7185", "#60a5fa", "#34d399", "#f97316"][burst % 5];
    for (let i = 0; i < 22; i += 1) {
      const angle = (Math.PI * 2 * i) / 22;
      const speed = 70 + ((i * 17 + burst * 11) % 80);
      fireworks.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.4 + (i % 5) * 0.12,
        age: 0,
        color,
      });
    }
  }
}

function updateFireworks(dt) {
  for (const spark of fireworks) {
    spark.age += dt;
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 60 * dt;
  }
  fireworks = fireworks.filter((spark) => spark.age < spark.life);
  if (state === "ended" && fireworks.length < 16) {
    spawnFireworks();
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawGrass();
  drawRoads();
  drawBuildings();
  drawStartFinish();
  drawCollectibles();
  drawTraffic();
  drawPlayer();
  drawPointerHint();
  drawFireworks();
}

function drawGrass() {
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "#c7f59a");
  gradient.addColorStop(0.52, "#9ee7a8");
  gradient.addColorStop(1, "#c6f1ef");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 97) % W;
    const y = (i * 53) % H;
    ctx.beginPath();
    ctx.ellipse(x, y, 3 + (i % 5), 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRoads() {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#8b95a5";
  ctx.lineWidth = roadWidth;
  for (const y of roadYs) {
    ctx.beginPath();
    ctx.moveTo(52, y);
    ctx.lineTo(1228, y);
    ctx.stroke();
  }
  for (const x of roadXs) {
    ctx.beginPath();
    ctx.moveTo(x, 64);
    ctx.lineTo(x, 700);
    ctx.stroke();
  }

  ctx.strokeStyle = "#b9c2cd";
  ctx.lineWidth = roadWidth - 14;
  for (const y of roadYs) {
    ctx.beginPath();
    ctx.moveTo(56, y);
    ctx.lineTo(1224, y);
    ctx.stroke();
  }
  for (const x of roadXs) {
    ctx.beginPath();
    ctx.moveTo(x, 68);
    ctx.lineTo(x, 696);
    ctx.stroke();
  }

  ctx.strokeStyle = "#fff7be";
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 18]);
  for (const y of roadYs) {
    ctx.beginPath();
    ctx.moveTo(62, y);
    ctx.lineTo(1218, y);
    ctx.stroke();
  }
  for (const x of roadXs) {
    ctx.beginPath();
    ctx.moveTo(x, 74);
    ctx.lineTo(x, 690);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawBuildings() {
  for (const b of buildings) {
    drawBuildingShadow(b);
    if (b.kind === "park") drawPark(b);
    else if (b.kind === "school") drawSchool(b);
    else if (b.kind === "hospital") drawHospital(b);
    else if (b.kind === "library") drawLibrary(b);
    else if (b.kind === "police") drawPolice(b);
    else if (b.kind === "bus") drawBusStop(b);
    else if (b.kind === "fire") drawFireStation(b);
    else if (b.kind === "cityHall") drawCityHall(b);
    else if (b.kind === "mall") drawMall(b);
    else if (b.kind === "market") drawMarket(b);
    else if (b.kind === "gas") drawGasStation(b);
    else if (b.kind === "museum") drawMuseum(b);
    else if (b.kind === "train") drawTrainStation(b);
    else if (b.kind === "cinema") drawCinema(b);
    else if (b.kind === "post") drawPostOffice(b);
    else if (b.kind === "clinic") drawClinic(b);
    else if (b.kind === "bakery") drawBakery(b);
    else if (b.kind === "pool") drawPool(b);
    else if (b.kind === "music") drawMusicHall(b);
    else if (b.kind === "flower") drawFlowerShop(b);
  }
}

function drawBuildingShadow(b) {
  ctx.fillStyle = "rgba(43, 62, 90, 0.14)";
  roundRect(b.x + 4, b.y + b.h - 8, b.w, 13, 8, ctx.fillStyle);
}

function drawBuildingLabel(b, y = b.y + b.h - 16, size = 19) {
  ctx.fillStyle = "#20304a";
  ctx.font = `bold ${size}px Microsoft YaHei, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(b.name, b.x + b.w / 2, y);
}

function drawTriangleRoof(b, lift = 12) {
  ctx.fillStyle = b.roof;
  ctx.beginPath();
  ctx.moveTo(b.x - 5, b.y + 19);
  ctx.lineTo(b.x + b.w / 2, b.y - lift);
  ctx.lineTo(b.x + b.w + 5, b.y + 19);
  ctx.closePath();
  ctx.fill();
}

function drawWindowGrid(b, startY = b.y + 25, count = 3) {
  ctx.fillStyle = "rgba(32, 48, 74, 0.18)";
  const gap = b.w / (count + 1);
  for (let i = 1; i <= count; i += 1) {
    roundRect(b.x + gap * i - 8, startY, 16, 14, 3, ctx.fillStyle);
  }
}

function drawStripedAwning(x, y, w, h, colors) {
  const stripeW = w / colors.length;
  for (let i = 0; i < colors.length; i += 1) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(x + i * stripeW, y, stripeW + 1, h);
  }
}

function drawSchool(b) {
  roundRect(b.x, b.y + 4, b.w, b.h - 4, 8, b.color);
  drawTriangleRoof(b, 11);
  roundRect(b.x + b.w / 2 - 17, b.y - 4, 34, 32, 6, "#ffe8a3");
  ctx.fillStyle = "#e45f5f";
  ctx.beginPath();
  ctx.moveTo(b.x + b.w / 2 - 22, b.y);
  ctx.lineTo(b.x + b.w / 2, b.y - 18);
  ctx.lineTo(b.x + b.w / 2 + 22, b.y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#20304a";
  ctx.beginPath();
  ctx.arc(b.x + b.w / 2, b.y + 12, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b.x + b.w / 2, b.y + 12);
  ctx.lineTo(b.x + b.w / 2, b.y + 6);
  ctx.moveTo(b.x + b.w / 2, b.y + 12);
  ctx.lineTo(b.x + b.w / 2 + 5, b.y + 15);
  ctx.stroke();
  drawWindowGrid(b, b.y + 34, 2);
  drawBuildingLabel(b);
}

function drawHospital(b) {
  roundRect(b.x + 6, b.y + 8, b.w - 12, b.h - 8, 7, b.color);
  roundRect(b.x + 26, b.y - 2, b.w - 52, b.h + 2, 7, "#f8fbff");
  ctx.fillStyle = b.roof;
  ctx.fillRect(b.x + 6, b.y + 8, b.w - 12, 9);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(b.x + b.w / 2 - 6, b.y + 21, 12, 30);
  ctx.fillRect(b.x + b.w / 2 - 18, b.y + 31, 36, 11);
  drawWindowGrid(b, b.y + 22, 4);
  drawBuildingLabel(b, b.y + b.h - 12);
}

function drawLibrary(b) {
  roundRect(b.x + 4, b.y + 15, b.w - 8, b.h - 15, 5, b.color);
  ctx.fillStyle = b.roof;
  ctx.beginPath();
  ctx.moveTo(b.x + 4, b.y + 16);
  ctx.lineTo(b.x + b.w / 2, b.y - 9);
  ctx.lineTo(b.x + b.w - 4, b.y + 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff7bd";
  ctx.fillRect(b.x + 14, b.y + 20, b.w - 28, 7);
  ctx.fillStyle = "#8f6a3d";
  for (let x = b.x + 22; x < b.x + b.w - 18; x += 22) {
    roundRect(x, b.y + 29, 10, 29, 3, ctx.fillStyle);
  }
  drawBuildingLabel(b, b.y + b.h - 13, 18);
}

function drawPolice(b) {
  roundRect(b.x, b.y + 6, b.w, b.h - 6, 8, b.color);
  ctx.fillStyle = b.roof;
  ctx.fillRect(b.x + 6, b.y - 1, b.w - 12, 18);
  roundRect(b.x + b.w / 2 - 19, b.y + 20, 38, 25, 8, "#2563eb");
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.moveTo(b.x + b.w / 2, b.y + 24);
  ctx.lineTo(b.x + b.w / 2 + 12, b.y + 35);
  ctx.lineTo(b.x + b.w / 2 + 6, b.y + 48);
  ctx.lineTo(b.x + b.w / 2 - 6, b.y + 48);
  ctx.lineTo(b.x + b.w / 2 - 12, b.y + 35);
  ctx.closePath();
  ctx.fill();
  drawWindowGrid(b, b.y + 25, 2);
  drawBuildingLabel(b);
}

function drawBusStop(b) {
  roundRect(b.x + 4, b.y + 13, b.w - 8, b.h - 13, 8, "#e7fbff");
  ctx.fillStyle = b.roof;
  ctx.beginPath();
  ctx.moveTo(b.x - 2, b.y + 18);
  ctx.lineTo(b.x + b.w / 2, b.y - 5);
  ctx.lineTo(b.x + b.w + 2, b.y + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#8bd3ff";
  ctx.fillRect(b.x + 16, b.y + 26, b.w - 32, 25);
  ctx.fillStyle = "#20304a";
  ctx.fillRect(b.x + 21, b.y + 53, b.w - 42, 5);
  drawBuildingLabel(b, b.y + b.h - 14, 17);
}

function drawFireStation(b) {
  roundRect(b.x, b.y + 4, b.w, b.h - 4, 8, b.color);
  drawTriangleRoof(b, 10);
  roundRect(b.x + 16, b.y + 28, 32, 33, 4, "#ffffff");
  roundRect(b.x + 68, b.y + 28, 32, 33, 4, "#ffffff");
  ctx.strokeStyle = "#b91c1c";
  ctx.lineWidth = 3;
  for (const doorX of [b.x + 16, b.x + 68]) {
    ctx.beginPath();
    ctx.moveTo(doorX, b.y + 39);
    ctx.lineTo(doorX + 32, b.y + 39);
    ctx.moveTo(doorX + 16, b.y + 28);
    ctx.lineTo(doorX + 16, b.y + 61);
    ctx.stroke();
  }
  ctx.fillStyle = "#b91c1c";
  ctx.font = "bold 20px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("119", b.x + b.w / 2, b.y + 20);
  drawBuildingLabel(b, b.y + b.h - 11, 18);
}

function drawCityHall(b) {
  roundRect(b.x + 7, b.y + 22, b.w - 14, b.h - 22, 4, b.color);
  ctx.fillStyle = b.roof;
  ctx.beginPath();
  ctx.moveTo(b.x + 6, b.y + 23);
  ctx.lineTo(b.x + b.w / 2, b.y - 6);
  ctx.lineTo(b.x + b.w - 6, b.y + 23);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f8f3df";
  for (let x = b.x + 20; x < b.x + b.w - 20; x += 22) {
    ctx.fillRect(x, b.y + 28, 11, 31);
  }
  ctx.fillStyle = "#7f8c8d";
  ctx.fillRect(b.x + 14, b.y + 58, b.w - 28, 6);
  drawBuildingLabel(b, b.y + b.h - 11, 18);
}

function drawMall(b) {
  roundRect(b.x + 3, b.y + 7, b.w - 6, b.h - 7, 8, b.color);
  drawStripedAwning(b.x + 8, b.y + 21, b.w - 16, 13, ["#db2777", "#ffffff", "#f9a8d4", "#ffffff", "#db2777"]);
  roundRect(b.x + 20, b.y + 38, b.w - 40, 21, 5, "#fff4fb");
  drawWindowGrid(b, b.y + 38, 2);
  drawBuildingLabel(b, b.y + b.h - 11);
}

function drawMarket(b) {
  roundRect(b.x + 3, b.y + 16, b.w - 6, b.h - 16, 8, "#dcfce7");
  drawStripedAwning(b.x + 4, b.y + 4, b.w - 8, 24, ["#16a34a", "#ffffff", "#22c55e", "#ffffff", "#16a34a"]);
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(b.x + 32, b.y + 43, 8, 0, Math.PI * 2);
  ctx.arc(b.x + 52, b.y + 43, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.arc(b.x + 75, b.y + 43, 8, 0, Math.PI * 2);
  ctx.fill();
  drawBuildingLabel(b, b.y + b.h - 12);
}

function drawGasStation(b) {
  ctx.fillStyle = "#f97316";
  ctx.fillRect(b.x + 6, b.y + 2, b.w - 12, 16);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(b.x + 14, b.y + 18, 8, b.h - 20);
  ctx.fillRect(b.x + b.w - 22, b.y + 18, 8, b.h - 20);
  roundRect(b.x + 31, b.y + 23, 45, 34, 6, b.color);
  roundRect(b.x + 43, b.y + 31, 18, 18, 4, "#60a5fa");
  ctx.strokeStyle = "#20304a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(b.x + 76, b.y + 34);
  ctx.quadraticCurveTo(b.x + 91, b.y + 38, b.x + 87, b.y + 54);
  ctx.stroke();
  drawBuildingLabel(b, b.y + b.h - 10, 18);
}

function drawPark(b) {
  roundRect(b.x, b.y, b.w, b.h, 12, "#a7e889");
  ctx.fillStyle = "#2f9e44";
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(b.x + 18 + i * 18, b.y + 24 + (i % 2) * 14, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(b.x + 35, b.y + 42, 10, 22);
  ctx.fillStyle = "#20304a";
  ctx.font = "bold 20px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(b.name, b.x + b.w / 2, b.y + b.h - 15);
}

function drawMuseum(b) {
  roundRect(b.x + 6, b.y + 24, b.w - 12, b.h - 24, 4, b.color);
  ctx.fillStyle = b.roof;
  ctx.beginPath();
  ctx.moveTo(b.x + 5, b.y + 25);
  ctx.lineTo(b.x + b.w / 2, b.y - 9);
  ctx.lineTo(b.x + b.w - 5, b.y + 25);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f4edff";
  for (let x = b.x + 22; x < b.x + b.w - 18; x += 21) {
    ctx.fillRect(x, b.y + 31, 10, 34);
  }
  ctx.fillStyle = "#7c3aed";
  ctx.fillRect(b.x + 16, b.y + 65, b.w - 32, 6);
  drawBuildingLabel(b, b.y + b.h - 10, 18);
}

function drawTrainStation(b) {
  roundRect(b.x + 3, b.y + 13, b.w - 6, b.h - 13, 8, b.color);
  ctx.fillStyle = b.roof;
  ctx.fillRect(b.x + 2, b.y + 7, b.w - 4, 14);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(b.x + b.w / 2, b.y + 34, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b.x + b.w / 2, b.y + 34);
  ctx.lineTo(b.x + b.w / 2, b.y + 25);
  ctx.moveTo(b.x + b.w / 2, b.y + 34);
  ctx.lineTo(b.x + b.w / 2 + 8, b.y + 37);
  ctx.stroke();
  ctx.fillStyle = "#475569";
  ctx.fillRect(b.x + 15, b.y + 58, b.w - 30, 5);
  drawBuildingLabel(b, b.y + b.h - 10, 18);
}

function drawCinema(b) {
  roundRect(b.x + 3, b.y + 8, b.w - 6, b.h - 8, 8, b.color);
  ctx.fillStyle = b.roof;
  ctx.fillRect(b.x + 7, b.y + 8, b.w - 14, 21);
  ctx.fillStyle = "#fde68a";
  for (let x = b.x + 16; x < b.x + b.w - 12; x += 18) {
    ctx.beginPath();
    ctx.arc(x, b.y + 18, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.moveTo(b.x + 35, b.y + 39);
  ctx.lineTo(b.x + 61, b.y + 52);
  ctx.lineTo(b.x + 35, b.y + 65);
  ctx.closePath();
  ctx.fill();
  drawBuildingLabel(b, b.y + b.h - 12, 18);
}

function drawPostOffice(b) {
  roundRect(b.x + 4, b.y + 10, b.w - 8, b.h - 10, 8, b.color);
  ctx.fillStyle = b.roof;
  ctx.fillRect(b.x + 9, b.y + 6, b.w - 18, 16);
  roundRect(b.x + 27, b.y + 30, b.w - 54, 27, 5, "#fff8bd");
  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(b.x + 28, b.y + 31);
  ctx.lineTo(b.x + b.w / 2, b.y + 47);
  ctx.lineTo(b.x + b.w - 28, b.y + 31);
  ctx.stroke();
  drawBuildingLabel(b, b.y + b.h - 10, 18);
}

function drawClinic(b) {
  roundRect(b.x + 4, b.y + 10, b.w - 8, b.h - 10, 8, b.color);
  drawTriangleRoof(b, 8);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(b.x + b.w / 2 - 5, b.y + 26, 10, 25);
  ctx.fillRect(b.x + b.w / 2 - 15, b.y + 34, 30, 9);
  drawWindowGrid(b, b.y + 25, 2);
  drawBuildingLabel(b, b.y + b.h - 11, 18);
}

function drawBakery(b) {
  roundRect(b.x + 3, b.y + 8, b.w - 6, b.h - 8, 8, b.color);
  drawStripedAwning(b.x + 8, b.y + 13, b.w - 16, 15, ["#c2410c", "#fff7ed", "#f97316", "#fff7ed", "#c2410c"]);
  ctx.fillStyle = "#b45309";
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.ellipse(b.x + 34 + i * 22, b.y + 39, 12, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  drawBuildingLabel(b, b.y + b.h - 10, 18);
}

function drawPool(b) {
  roundRect(b.x + 3, b.y + 8, b.w - 6, b.h - 8, 8, "#dff7ff");
  ctx.fillStyle = b.roof;
  ctx.beginPath();
  ctx.moveTo(b.x + 4, b.y + 18);
  ctx.lineTo(b.x + b.w / 2, b.y - 6);
  ctx.lineTo(b.x + b.w - 4, b.y + 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(b.x + 22, b.y + 36 + i * 9);
    ctx.bezierCurveTo(b.x + 42, b.y + 29 + i * 9, b.x + 58, b.y + 43 + i * 9, b.x + 80, b.y + 36 + i * 9);
    ctx.stroke();
  }
  drawBuildingLabel(b, b.y + b.h - 9, 18);
}

function drawMusicHall(b) {
  roundRect(b.x + 4, b.y + 8, b.w - 8, b.h - 8, 8, b.color);
  ctx.fillStyle = b.roof;
  ctx.beginPath();
  ctx.moveTo(b.x + 4, b.y + 20);
  ctx.quadraticCurveTo(b.x + b.w / 2, b.y - 15, b.x + b.w - 4, b.y + 20);
  ctx.lineTo(b.x + b.w - 4, b.y + 28);
  ctx.lineTo(b.x + 4, b.y + 28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4c1d95";
  ctx.font = "bold 31px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("♪", b.x + 43, b.y + 53);
  ctx.fillText("♫", b.x + 77, b.y + 50);
  drawBuildingLabel(b, b.y + b.h - 9, 18);
}

function drawFlowerShop(b) {
  roundRect(b.x + 3, b.y + 8, b.w - 6, b.h - 8, 8, b.color);
  drawStripedAwning(b.x + 7, b.y + 12, b.w - 14, 15, ["#ec4899", "#ffffff", "#f9a8d4", "#ffffff", "#ec4899"]);
  const flowers = [
    [b.x + 33, b.y + 43, "#f472b6"],
    [b.x + 57, b.y + 40, "#facc15"],
    [b.x + 81, b.y + 44, "#60a5fa"],
  ];
  for (const [x, y, color] of flowers) {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.arc(x + Math.cos((i * Math.PI * 2) / 5) * 7, y + Math.sin((i * Math.PI * 2) / 5) * 7, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  drawBuildingLabel(b, b.y + b.h - 9, 18);
}

function drawStartFinish() {
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(startPoint.x, startPoint.y, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 19px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("起点", startPoint.x, startPoint.y);

  const pulse = 1 + Math.sin(finishPulse * 5) * 0.08;
  ctx.save();
  ctx.translate(finishPoint.x, finishPoint.y);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "#f43f5e";
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 19px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("终点", 0, 0);
  ctx.restore();
}

function drawCollectibles() {
  if (!collectibles.length) return;
  for (const item of collectibles) {
    if (item.collected) continue;
    if (item.type === "coin") {
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(item.x, item.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b7791f";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "#fff8b5";
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", item.x, item.y + 1);
    } else if (item.type === "chest") {
      drawChest(item.x, item.y, item.value);
    } else {
      drawTreasure(item.x, item.y, item.item);
    }
  }
}

function drawChest(x, y, value) {
  roundRect(x - 20, y - 13, 40, 29, 6, "#b45309");
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(x - 20, y - 6, 40, 8);
  ctx.fillStyle = "#fde68a";
  ctx.fillRect(x - 4, y - 13, 8, 29);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`+${value}`, x, y + 1);
}

function drawTreasure(x, y, item) {
  ctx.fillStyle = item.color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? 18 : 8;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#20304a";
  ctx.font = "bold 15px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item.icon, x, y + 1);
}

function drawTraffic() {
  if (!traffic.length) return;
  for (const car of traffic) {
    drawCar(car.x, car.y, car.route.type === "h" ? 0 : Math.PI / 2, car.color, car.w, car.h, false, car.dir);
  }
}

function drawPlayer() {
  if (!player) return;
  const flash = player.invincible > 0 && Math.floor(player.invincible * 18) % 2 === 0;
  if (flash) return;
  drawCar(player.x, player.y, player.heading, "#ffd348", 50, 30, true, 1);
}

function drawCar(x, y, angle, color, w, h, isPlayer, dir) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + (dir < 0 ? Math.PI : 0));
  roundRect(-w / 2, -h / 2, w, h, 8, color);
  ctx.fillStyle = isPlayer ? "#fff7ad" : "rgba(255, 255, 255, 0.78)";
  roundRect(-w * 0.12, -h * 0.34, w * 0.28, h * 0.68, 5, ctx.fillStyle);
  ctx.fillStyle = "#20304a";
  ctx.fillRect(-w * 0.35, -h * 0.58, w * 0.2, 5);
  ctx.fillRect(w * 0.16, -h * 0.58, w * 0.2, 5);
  ctx.fillRect(-w * 0.35, h * 0.42, w * 0.2, 5);
  ctx.fillRect(w * 0.16, h * 0.42, w * 0.2, 5);
  ctx.fillStyle = "#fff8c7";
  ctx.fillRect(w / 2 - 4, -h * 0.25, 5, h * 0.18);
  ctx.fillRect(w / 2 - 4, h * 0.07, 5, h * 0.18);
  ctx.restore();
}

function drawPointerHint() {
  if (state !== "running") return;
  ctx.save();
  ctx.strokeStyle = pointer.valid ? "rgba(37, 99, 235, 0.72)" : "rgba(239, 68, 68, 0.64)";
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 7]);
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawFireworks() {
  for (const spark of fireworks) {
    const alpha = Math.max(0, 1 - spark.age / spark.life);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function roundRect(x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function loop(timestamp) {
  const dt = Math.min(0.033, (timestamp - lastTime) / 1000 || 0);
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

ui.difficultyCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedDifficulty = card.dataset.difficulty;
    ui.difficultyCards.forEach((item) => item.classList.toggle("selected", item === card));
  });
});

ui.startButton.addEventListener("click", resetGame);
ui.restartButton.addEventListener("click", () => {
  state = "start";
  fireworks = [];
  ui.celebrationLayer.innerHTML = "";
  ui.endScreen.classList.add("hidden");
  ui.startScreen.classList.remove("hidden");
});

canvas.addEventListener("mousemove", handlePointerMove);
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchstart", handleTouchMove, { passive: false });

requestAnimationFrame(loop);
