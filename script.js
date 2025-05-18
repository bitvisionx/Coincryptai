const apiBase = "https://api.bitvavo.com/v2";
const select = document.getElementById("cryptoSelect");
const priceP = document.getElementById("price");
const prediction1h = document.getElementById("prediction1h");
const prediction6h = document.getElementById("prediction6h");
const prediction24h = document.getElementById("prediction24h");

const favoritesKey = "crypvisionx_favorites";

async function loadCoins() {
  const res = await fetch(`${apiBase}/markets`);
  const coins = await res.json();
  const favorites = getFavorites();

  coins
    .filter(c => c.quote === "EUR")
    .forEach(c => {
      const option = document.createElement("option");
      option.value = c.market;
      option.textContent = `${c.market.split("-")[0]} (${c.market})`;
      if (favorites.includes(c.market)) {
        option.textContent = "⭐ " + option.textContent;
      }
      select.appendChild(option);
    });

  select.addEventListener("change", predictAll);
  predictAll();
}

function getFavorites() {
  return JSON.parse(localStorage.getItem(favoritesKey)) || [];
}

function toggleFavorite() {
  const favs = getFavorites();
  const current = select.value;
  if (favs.includes(current)) {
    localStorage.setItem(favoritesKey, JSON.stringify(favs.filter(f => f !== current)));
  } else {
    favs.push(current);
    localStorage.setItem(favoritesKey, JSON.stringify(favs));
  }
  location.reload();
}

async function predictAll() {
  const market = select.value;
  if (!market) return;

  const res = await fetch(`${apiBase}/${market}/ticker/price`);
  const data = await res.json();
  const price = parseFloat(data.price);
  priceP.textContent = `Huidige prijs: €${price.toFixed(2)}`;

  prediction1h.textContent = `1 uur: ${predict(price)}`;
  prediction6h.textContent = `6 uur: ${predict(price)}`;
  prediction24h.textContent = `24 uur: ${predict(price)}`;
}

function predict(currentPrice) {
  const change = (Math.random() - 0.5) * 0.1; // tussen -5% en +5%
  const future = currentPrice * (1 + change);
  const diff = future - currentPrice;
  const sign = diff >= 0 ? "+" : "";
  return `€${future.toFixed(2)} (${sign}${diff.toFixed(2)} EUR)`;
}

loadCoins();
