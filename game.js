let foods = [];
let dailyPairs = [];
let resultsHistory = [];
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

function getNumericRating(food) {
  if (food.rating === "Disqualified" || food.rating === "Failure" || food.rating === "NO!" || food.rating === "No Rating") {
    return -0.5;
  }
  if (food.rating === "YES!") {
    return 100.0;
  }
  return Number(food.rating);
}

function generateDailyPairs() {
  const rng = mulberry32(getDailySeed());
  const pairs = [];

  while (pairs.length < 10) {
    const f1 = foods[Math.floor(rng() * foods.length)];
    const f2 = foods[Math.floor(rng() * foods.length)];
    if (f1.name !== f2.name && getNumericRating(f1) !== getNumericRating(f2)) {
      if (!pairs.some(p => (p[0] === f1 && p[1] === f2) || (p[0] === f2 && p[1] === f1))) {
        pairs.push([f1, f2]);
      }
    }
  }
  return pairs;
}

function startRound() {
  if (round >= 10) {
    endGame();
    return; 
  }

  const [f1, f2] = dailyPairs[round];
  const container = document.getElementById("choices");
  container.innerHTML = "";
  document.getElementById("result").textContent = `Round ${round + 1} of 10`;

  [f1, f2].forEach(food => {
    const btn = document.createElement("button");
    btn.className = "choice";

    // Food name above image
    const nameEl = document.createElement("div");
    nameEl.textContent = food.name;
    nameEl.style.margin = "0.5rem 0";
    btn.appendChild(nameEl);

    // Image
    const imgEl = document.createElement("img");
    imgEl.src = food.image;
    imgEl.alt = food.name;
    imgEl.style.cursor = "pointer";
    imgEl.onerror = () => { imgEl.src = "images/0.png"; };
    btn.appendChild(imgEl);

    btn.onclick = () => {
      document.querySelectorAll(".choice").forEach(b => b.disabled = true);

      const f1Rating = getNumericRating(f1);
      const f2Rating = getNumericRating(f2);

      const isCorrect = getNumericRating(food) > (food === f1 ? f2Rating : f1Rating);

      resultsHistory.push({ correct: isCorrect });

      if (isCorrect) {
        score++;
        document.getElementById("result").textContent =
          `✅ Correct! (${f1.name}: ${f1.rating}, ${f2.name}: ${f2.rating}) | Score: ${score}`;
      } else {
        document.getElementById("result").textContent =
          `❌ Wrong! (${f1.name}: ${f1.rating}, ${f2.name}: ${f2.rating}) | Score: ${score}`;
      }

      round++;
      setTimeout(startRound, 3000);
    };

    container.appendChild(btn);
  });
}


function endGame() {
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  const resultDiv = document.getElementById("result");

  // Build results string
  let resultsString = "";
  for (let r of resultsHistory) {
    resultsString += r.correct ? "🟩" : "🟥";
  }

  resultsString += ` ${score}/${round}`;

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0]; // yyyy-mm-dd
  resultsString += ` | ${formattedDate}`;

  resultDiv.innerHTML = resultsString;
  
  resultsString += ` | https://www.ordinarysaudle.com`;

  const copyBtn = document.createElement("copyBtn");
  copyBtn.textContent = "Copy Results";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(resultsString).then(() => {
      alert("Results copied!");
    });
  };

  resultDiv.appendChild(document.createElement("br"));
  resultDiv.appendChild(copyBtn);
}

// ---- Load the food jsons then start game ----
Promise.all([
  fetch("sausages.json").then(res => res.json()),
  fetch("nses.json").then(res => res.json())
])
.then(([sausagesData, nsesData]) => {
  foods = [...sausagesData, ...nsesData];
  dailyPairs = generateDailyPairs();
  startRound();
})
.catch(err => {
  console.error("Failed to load JSON files", err);
  document.getElementById("result").textContent = "Error loading food data.";
});































