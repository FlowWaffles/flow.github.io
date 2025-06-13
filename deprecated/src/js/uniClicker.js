let points = 300;
let pointsPerSecond = 0;
let iterator = 0;
// manual clicker
let pointsPerClick = 1;
let pricePointsPerClick = 50;
const pointsPerClickCostFactor = 1.2;
// auto clickers
let priceNyanCat = 20;
let priceNyanCatEfficiency = 100;
let amountNyanCats = 0;
const nyanCatCostFactor = 1.1;
const nyanCatEfficencyCostFactor = 1.2;
let nyanCatEfficiency = 1;
// auto clicker upgrade
let priceSuperNyanCat = 200;
let amountSuperNyanCats = 0;
const superNyanCatCostFactor = 1.2;
const superNyanCatUpgradeEfficiency = 5;
// super auto clicker upgrade
let priceUltraNyanCat = 500;
let amountUltraNyanCat = 0;
const ultraNyanCatUpgradeCostFactor = 1.2;
const ultraNyanCatUpgradeEfficiency = 15;
// catnip booster
const boosterEfficiency = 1.5;
const priceBooster = 100;
let amountBooster = 0;
const boosterBaseAmount = 100;

window.addEventListener("load", (event) => {
  update();
});

// DOM Elements
const pointsPerClickButton = document.getElementById("upgradePointsPerClick");
const pointsPerClickElementWrapper = document.getElementById(
  "upgradePointsPerClickWrapper"
);
const pointsDisplay = document.getElementById("points");
const pointsPerSecondDisplay = document.getElementById("pointsPerSecond");
const autoClickerButton = document.getElementById("autoClickerButton");
const nyanCatEfficencyButton = document.getElementById(
  "nyanCatEfficencyButton"
);
const autoClickerButtonWrapper = document.getElementById(
  "autoClickerButtonWrapper"
);
const upgradeAutoClickerButton = document.getElementById("upgradeAutoClicker");
const upgradeSuperAutoClickerButton = document.getElementById(
  "upgradeSuperAutoClicker"
);
const buyCatNipButton = document.getElementById("buyCatNip");

// tooltip wrapper
const createTooltip = (element, content, options) =>
  tippy(element, {
    theme: "customTooltip",
    content,
    allowHTML: true,
    dynamicTitle: true,
    ...options,
  });

// tooltips
const pointsTooltip = createTooltip(
  pointsDisplay,
  `<strong >You currently have  <span class="tooltip-points">${points}</span> 🦄</strong>`
);
const pointsPerSecondTooltip = createTooltip(
  pointsPerSecondDisplay,
  `<strong >You currently gain <span class="tooltip-points">${pointsPerSecond}</span> 🦄 per second</strong>`
);
// const autoClickerTooltip = createTooltip(
//   autoClickerButtonWrapper,
//   `<strong >Add 1 Nyan Cat to your Selection <span class="tooltip-points">+ ${nyanCatPointsPerSecond}</span> 🦄 per second</strong>`
// );

// update tootlips
function updateTooltips() {
  pointsTooltip.setContent(
    `<strong >You currently have <span class="tooltip-points">${points}</span> 🦄</strong>`
  );
  pointsPerSecondTooltip.setContent(
    `<strong >You currently gain <span class="tooltip-points">${pointsPerSecond}</span> 🦄 per second</strong>`
  );
  // autoClickerTooltip.setContent(
  //   `<strong >Add 1 Nyan Cat to your Selection <span class="tooltip-points">+ ${nyanCatPointsPerSecond}</span> 🦄 per second</strong>`
  // );
}

//update function
function update() {
  pointsPerSecond =
    nyanCatEfficiency * amountNyanCats +
    superNyanCatUpgradeEfficiency * amountSuperNyanCats +
    ultraNyanCatUpgradeEfficiency * amountUltraNyanCat;

  if (amountBooster > 0) {
    pointsPerSecond = pointsPerSecond * boosterEfficiency;
    if (iterator % 5 === 0) {
      amountBooster =
        amountBooster -
        (amountNyanCats + +amountSuperNyanCats + amountUltraNyanCat);
      if (amountBooster < 0) {
        amountBooster = 0;
      }
    }
  }

  pointsPerClickButton.dataset.price = pricePointsPerClick;
  autoClickerButton.dataset.price = priceNyanCat;
  nyanCatEfficencyButton.dataset.price = priceNyanCatEfficiency;
  upgradeAutoClickerButton.dataset.price = priceSuperNyanCat;
  upgradeSuperAutoClickerButton.dataset.price = priceUltraNyanCat;
  buyCatNipButton.dataset.price = priceBooster;
  updatePoints();
  updateCanPurchase();
  updatePointsPerSecond(pointsPerSecond);
  updateFields();
  updateTooltips();

  iterator++;
}

function generatePoints() {
  points += pointsPerSecond;
}

setInterval(update, 1000);
setInterval(generatePoints, 1000);

function updatePoints() {
  pointsDisplay.innerHTML = Math.ceil(points * 10) / 10;
}

function updatePointsPerSecond(pointsPerSecond) {
  pointsPerSecondDisplay.innerHTML = Math.ceil(pointsPerSecond * 10) / 10;
}

function updateFields() {
  //points per click
  document.getElementById("upgradePointsPerClick").innerHTML =
    "Upgrade Points per Click +1: " + pricePointsPerClick;
  // auto clickers
  document.getElementById("priceNyanCatEfficiency").innerHTML =
    priceNyanCatEfficiency;
  document.getElementById("nyanCatEfficiency").innerHTML =
    "Nyan Cat Efficiency: " + Math.ceil(nyanCatEfficiency * 100) / 100;
  if (amountNyanCats > 0) {
    document.getElementById("autoclickerCost").innerHTML = priceNyanCat;
    document.getElementById("amountAutoClicker").innerHTML =
      "Nyan Cats: " + amountNyanCats;
  } else {
    document.getElementById("amountAutoClicker").innerHTML = "";
  }
  // upgraded clickers
  document.getElementById("upgradeAutoClicker").dataset.ownedNyanCats =
    amountNyanCats;
  if (amountSuperNyanCats) {
    document.getElementById("upgradeAutoClickerCost").innerHTML =
      priceSuperNyanCat;
    document.getElementById("amountUpgradedClickers").innerHTML =
      "Super Nyan Cats: " + amountSuperNyanCats;
  } else {
    document.getElementById("amountUpgradedClickers").innerHTML = "";
  }
  // super upgraded clickers
  document.getElementById(
    "upgradeSuperAutoClicker"
  ).dataset.ownedSuperNyanCats = amountSuperNyanCats;
  if (amountUltraNyanCat) {
    document.getElementById("upgradeSuperAutoClickerCost").innerHTML =
      priceUltraNyanCat;
    document.getElementById("amountSuperUpgradedClickers").innerHTML =
      "Ultra Nyan Cats: " + amountUltraNyanCat;
  } else {
    document.getElementById("amountSuperUpgradedClickers").innerHTML = "";
  }

  // catnip
  if (amountBooster) {
    document.getElementById("amountCatNip").innerHTML =
      "Catnip left: " + amountBooster;
  } else {
    document.getElementById("amountCatNip").innerHTML = "";
  }
}

function updateCanPurchase() {
  document.querySelectorAll("button").forEach((button) => {
    if (button.dataset.price) {
      button.disabled = button.dataset.price > points;
    }
    if (button.dataset.ownedNyanCats) {
      button.disabled =
        parseInt(button.dataset.ownedNyanCats) === 0 ||
        button.dataset.price > points;
    }
    if (button.dataset.ownedSuperNyanCats) {
      button.disabled =
        parseInt(button.dataset.ownedSuperNyanCats) === 0 ||
        button.dataset.price > points;
    }
  });
}

function addPoints() {
  points += pointsPerClick;
  updatePoints();
  updateTooltips();
}

function buyItem(amount) {
  if (points < amount) {
    return false;
  }

  points = points - amount;
  update();
  return true;
}

function buyAutoClicker() {
  if (buyItem(priceNyanCat)) {
    priceNyanCat =
      Math.ceil(Math.round(priceNyanCat * nyanCatCostFactor) / 5) * 5;
    amountNyanCats += 1;
    if (amountNyanCats <= 50) {
      createAutoClicker();
    }
  }
}

function upgradePointsPerClick() {
  if (buyItem(pricePointsPerClick)) {
    pointsPerClick += 1;
    pricePointsPerClick =
      Math.ceil(
        Math.round(pricePointsPerClick * pointsPerClickCostFactor) / 5
      ) * 5;
    document.getElementById("pointsPerClick").innerHTML = pointsPerClick;
  }
}

function upgradeNyanCatEfficency() {
  if (buyItem(priceNyanCatEfficiency)) {
    nyanCatEfficiency *= 1.2;
    priceNyanCatEfficiency =
      Math.ceil(
        Math.round(priceNyanCatEfficiency * nyanCatEfficencyCostFactor) / 5
      ) * 5;
    document.getElementById("priceNyanCatEfficiency").innerHTML =
      priceNyanCatEfficiency;
  }
}

function upgradeAutoClicker() {
  if (amountNyanCats > 0) {
    if (buyItem(priceSuperNyanCat)) {
      amountNyanCats -= 1;
      amountSuperNyanCats += 1;
      priceSuperNyanCat =
        Math.ceil(Math.round(priceSuperNyanCat * superNyanCatCostFactor) / 5) *
        5;
      document.getElementById("upgradeAutoClickerCost").innerHTML =
        priceSuperNyanCat;
      let upgradedClicker = document.getElementsByClassName("autoClicker")[0];
      if (upgradedClicker) {
        const minDuration = 3;
        const maxDuration = 6;
        const duration =
          Math.random() * (maxDuration - minDuration) + minDuration;
        upgradedClicker.classList.replace("autoClicker", "autoClickerUpgrade");
        upgradedClicker.style.setProperty(
          "--animation-duration",
          `${duration}s`
        );
      }
    }
  }
}

function upgradeSuperAutoClicker() {
  if (amountSuperNyanCats > 0) {
    if (buyItem(priceUltraNyanCat)) {
      amountSuperNyanCats -= 1;
      amountUltraNyanCat += 1;
      priceUltraNyanCat =
        Math.ceil(
          Math.round(priceUltraNyanCat * ultraNyanCatUpgradeCostFactor) / 5
        ) * 5;
      document.getElementById("upgradeSuperAutoClickerCost").innerHTML =
        priceUltraNyanCat;
      let upgradedClicker =
        document.getElementsByClassName("autoClickerUpgrade")[0];
      if (upgradedClicker) {
        const minDuration = 2;
        const maxDuration = 4;
        const duration =
          Math.random() * (maxDuration - minDuration) + minDuration;
        upgradedClicker.classList.replace(
          "autoClickerUpgrade",
          "autoClickerSuperUpgrade"
        );
        upgradedClicker.style.setProperty(
          "--animation-duration",
          `${duration}s`
        );
      }
    }
  }
}

function buyCatNip() {
  if (buyItem(priceBooster)) {
    amountBooster += boosterBaseAmount;
  }
}

function createAutoClicker() {
  const minDuration = 5;
  const maxDuration = 10;
  const duration = Math.random() * (maxDuration - minDuration) + minDuration;
  const clicker = document.createElement("div");
  const clickerContainer = document.createElement("div");
  clicker.classList.add("autoClicker");
  clickerContainer.classList.add("autoClicker-container");
  clickerContainer.appendChild(clicker);
  clicker.style.setProperty("--animation-duration", `${duration}s`);
  document.body.appendChild(clickerContainer);
}
