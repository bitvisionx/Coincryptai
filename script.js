const cryptoSelect = document.getElementById("cryptoSelect");
const result = document.getElementById("result");
const favToggle = document.getElementById("favToggle");
const timeButtons = document.querySelectorAll(".time-buttons button");

let coins = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let selectedHours = 6; // default 6 uur

// Bitfavo API voor tickers
const API_URL = "https://api.bitvavo.com/v2/markets";

async function fetchCoins() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    // filter alleen crypto met EUR paar en zet in select
    coins = data
      .filter(m => m.market.startsWith("EUR") && !m.market.includes("EUR/EUR"))
      .map(m => m.market.replace("EUR", "").toUpperCase())
      .sort();

    // voeg Livepeer erbij als die niet in de lijst zit
    if (!coins.includes("LPT")) coins.push("LPT");

    renderSelect();
  } catch (e) {
    console.error("Fout bij ophalen coins:", e);
    result.textContent = "Kan de coinlijst niet laden.";
  }
}

function renderSelect() {
  cryptoSelect.innerHTML = "";
  coins.forEach(coin => {
    const option = document.createElement("option");
    option.value = coin;
    option.textContent = coin + (favorites.includes(coin) ? " ★" : "");
    cryptoSelect.appendChild(option);
  });
  if (coins.length) {
    cryptoSelect.value = coins[0];
    updatePrediction();
  }
}

function updatePrediction() {
  const coin = cryptoSelect.value;
  result.textContent = "Laden...";
  fetchPriceAndPrediction(coin, selectedHours).then(data => {
    if (!data) {
      result.textContent = "Kon data niet ophalen.";
      return;
    }
    const { price, predictionEuro } = data;
    result.innerHTML = `
      Actuele prijs: €${price.toFixed(4)}<br/>
      Verwachte verandering in € (${selectedHours} uur): ${predictionEuro >= 0 ? "+" : ""}${predictionEuro.toFixed(4)}<br/>
      Voorspelling: ${predictionEuro >= 0 ? "stijging 📈" : predictionEuro < 0 ? "daling 📉" : "stabiel 🤝"}
    `;
  });
}

// Simuleer AI voorspelling met eenvoudige logica op basis van RSI en Bollinger (dummy data)
function simulateAIPrediction(price, rsi, bollinger) {
  // rsi: 0-100, bollinger: % afstand tot midden band
  let changePercent = 0;

  if (rsi < 30) changePercent += 0.05;   // oversold => stijging
  if (rsi > 70) changePercent -= 0.05;   // overbought => daling
  if (bollinger < -5) changePercent += 0.03;
  if (bollinger > 5) changePercent -= 0.03;

  // kleine random factor
  changePercent += (Math.random() - 0.5) * 0.02;

  return price * changePercent;
}

async function fetchPriceAndPrediction(coin, hours) {
  try {
    // Prijs ophalen
    const tickerRes = await fetch(`https://api.bitvavo.com/v2/ticker/price?market=${coin}-EUR`);
    const tickerData = await tickerRes.json();
    const price = parseFloat(tickerData.price);

    // Dummy indicator data ophalen - in werkelijkheid zou je een echte indicator API gebruiken of zelf berekenen
    const rsi = 50 + (Math.random() - 0.5) * 50;  // willekeurige RSI tussen 25 en 75
    const bollinger = (Math.random() - 0.5) * 20; // willekeurige bollinger band afstand -10 tot +10%

    // AI voorspelling
    let predictedChange = simulateAIPrediction(price, rsi, bollinger);

    // Schalen voor tijd
    if (hours === 1) predictedChange *= 0.5;
    else if (hours === 24) predictedChange *= 2;

    return { price, predictionEuro: predictedChange };
  } catch (e) {
    console.error("Fout bij ophalen prijs/voorspelling:", e);
    return null;
  }
}

// Favorieten opslaan / verwijderen
function toggleFavorite() {
  const coin = cryptoSelect.value;
  if (favorites.includes(coin)) {
    favorites = favorites.filter(c => c !== coin);
  } else {
    favorites.push(coin);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderSelect();
}

// Event listeners
cryptoSelect.addEventListener("change", () => updatePrediction());

favToggle.addEventListener("click", () => {
  toggleFavorite();
  updatePrediction();
});

timeButtons.forEach(button => {
  button.addEventListener("click", () => {
    timeButtons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    selectedHours = parseInt(button.getAttribute("data-hours"));
    updatePrediction();
  });
});

// Start app
fetchCoins();
