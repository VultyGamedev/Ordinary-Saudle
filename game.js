let foods = [];
let dailyPairs = [];
let round = 0;
let score = 0;

// ---- Seeded random number generator ----
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

function getDailySeed() {
  const today = new Date();
  return parseInt(
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0")
  );
}

function generateDailyPairs() {
  const rng = mulberry32(getDailySeed());
  const pairs = [];

  while (pairs.length < 10) {
    const f1 = foods[Math.floor(rng() * foods.length)];
    const f2 = foods[Math.floor(rng() * foods.length)];
    if (f1.name !== f2.name && f1.rating !== f2.rating) {
      if (!pairs.some(p => (p[0] === f1 && p[1] === f2) || (p[0] === f2 && p[1] === f1))) {
        pairs.push([f1, f2]);
      }
    }
  }
  return pairs;
}

function startRound() {
  if (round >= 10) {
    document.getElementById("choices").innerHTML = "";
    document.getElementById("result").textContent =
      `🎉 You finished! Final Score: ${score}/10`;
    return;
  }

  const [f1, f2] = dailyPairs[round];
  const container = document.getElementById("choices");
  container.innerHTML = "";
  document.getElementById("result").textContent = `Round ${round + 1} of 10`;

  [f1, f2].forEach(food => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = food.name;
    btn.onclick = () => {
      if (food.rating > (food === f1 ? f2.rating : f1.rating)) {
        score++;
        document.getElementById("result").textContent =
          `✅ Correct! (${f1.name}: ${f1.rating}, ${f2.name}: ${f2.rating}) | Score: ${score}`;
      } else {
        document.getElementById("result").textContent =
          `❌ Wrong! (${f1.name}: ${f1.rating}, ${f2.name}: ${f2.rating}) | Score: ${score}`;
      }
      round++;
      setTimeout(startRound, 1500);
    };
    container.appendChild(btn);
  });
}

// ---- Load foods.json then start game ----
fetch("foods.json")
  .then(response => response.json())
  .then(data => {
    foods = data;
    dailyPairs = generateDailyPairs();
    startRound();
  })
  .catch(err => {
    console.error("Failed to load foods.json", err);
    document.getElementById("result").textContent = "Error loading food data.";
  });
