let foods = [];
let currentRound = 0;
let score = 0;
const totalRounds = 10;
let roundLocked = false; // prevents multiple clicks

Promise.all([
  fetch("sausages.json")
    .then(res => res.json())
    .then(data => data.map(f => ({ ...f, source: "sausages" }))),
  fetch("nses.json")
    .then(res => res.json())
    .then(data => data.map(f => ({ ...f, source: "nses" })))
])
.then(([sausagesData, nsesData]) => {
  foods = [...sausagesData, ...nsesData];
  startRound();
});

function startRound() {
  if (currentRound >= totalRounds) {
    document.getElementById("game").innerHTML =
      `<h2>Game Over! Your score: ${score}/${totalRounds}</h2>`;
    return;
  }

  roundLocked = false;

  let food1, food2;
  do {
    food1 = foods[Math.floor(Math.random() * foods.length)];
    food2 = foods[Math.floor(Math.random() * foods.length)];
  } while (food1.id === food2.id || food1.rank === food2.rank);

  renderChoices(food1, food2);
}

function renderChoices(food1, food2) {
  const gameDiv = document.getElementById("game");

  gameDiv.classList.remove("fade-in");
  void gameDiv.offsetWidth; // trigger reflow to restart animation

  gameDiv.innerHTML = `
    <div class="food-container">
      <h3>${food1.name}</h3>
      <div class="image-wrapper" onclick="choose(this, ${food1.rank}, ${food2.rank})">
        <img src="${food1.source}/${food1.id}.png" onerror="this.src='images/0.png'">
        <span class="score hidden">${food1.rank}</span>
      </div>
    </div>
    <div class="food-container">
      <h3>${food2.name}</h3>
      <div class="image-wrapper" onclick="choose(this, ${food2.rank}, ${food1.rank})">
        <img src="${food2.source}/${food2.id}.png" onerror="this.src='images/0.png'">
        <span class="score hidden">${food2.rank}</span>
      </div>
    </div>
    <p>Round ${currentRound + 1} of ${totalRounds}</p>
    <p>Score: ${score}</p>
  `;

  gameDiv.classList.add("fade-in");
}

function choose(clickedEl, selectedRank, otherRank) {
  if (roundLocked) return;
  roundLocked = true;

  // reveal all scores
  document.querySelectorAll(".score").forEach(s => s.classList.remove("hidden"));

  if (selectedRank > otherRank) {
    score++;
  }
  currentRound++;

  setTimeout(() => {
    startRound();
  }, 1500); // wait so player can see the result
}





