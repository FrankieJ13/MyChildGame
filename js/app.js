import { getMapById, getCellEffect, clampPosition } from "./board.js";
import { animateDice, rollDice, setDiceValue } from "./dice.js";
import { advanceTurn, createGame, getCurrentPlayer, getElapsedSeconds, getWinner, hasWinner, hydrateGame } from "./game-state.js";
import { createDefaultPlayers, createPlayer, sortLeaders } from "./players.js";
import { clearCurrentGame, loadCurrentGame, loadResults, saveCurrentGame, saveResult } from "./storage.js";
import {
  $,
  formatTime,
  renderAvatarModal,
  renderBoardCells,
  renderLeaders,
  renderMapCarousel,
  renderPlayerSetup,
  renderTokens,
  showInfo
} from "./ui.js";

let setupPlayers = createDefaultPlayers();
let selectedMapId = "sunny-trail";
let avatarEditIndex = 0;
let game = null;
let timerId = null;
let isRolling = false;
let zoom = 1;
let deferredInstallPrompt = null;

function init() {
  bindStartScreen();
  bindGameScreen();
  bindPwaInstall();
  refreshSetup();
  $("#resume-panel").classList.toggle("hidden", !loadCurrentGame());
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
  }
}

function bindStartScreen() {
  $("#add-player-button").addEventListener("click", () => {
    setupPlayers.push(createPlayer(setupPlayers.length + 1));
    refreshSetup();
  });

  $("#start-game-button").addEventListener("click", () => {
    if (setupPlayers.length < 2) {
      showInfo("Нужно больше игроков", "<p>Для старта нужно минимум два игрока.</p>");
      return;
    }
    startGame(createGame({ players: setupPlayers, mapId: selectedMapId }));
  });

  $("#resume-game-button").addEventListener("click", () => {
    const saved = loadCurrentGame();
    if (saved) startGame(hydrateGame(saved));
  });

  $("#avatar-modal").addEventListener("close", refreshSetup);
}

function bindGameScreen() {
  $("#dice-button").addEventListener("click", handleRoll);
  $("#pause-button").addEventListener("click", pauseGame);
  $("#continue-button").addEventListener("click", continueGame);
  $("#menu-button").addEventListener("click", () => $("#hamburger-menu").classList.toggle("hidden"));
  $("#zoom-range").addEventListener("input", (event) => {
    zoom = Number(event.target.value) / 100;
    setZoomMode("manual");
  });
  document.querySelectorAll("[data-zoom-mode]").forEach((button) => {
    button.addEventListener("click", () => setZoomMode(button.dataset.zoomMode));
  });
  $("#hamburger-menu").addEventListener("click", handleMenuAction);
  setupPinchZoom();
}

function bindPwaInstall() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    $("#install-button").classList.remove("hidden");
  });
  $("#install-button").addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    $("#install-button").classList.add("hidden");
  });
}

function refreshSetup() {
  renderPlayerSetup(
    setupPlayers,
    (index, name) => {
      setupPlayers[index].name = name;
    },
    (index) => {
      avatarEditIndex = index;
      renderAvatarModal(setupPlayers[index].avatar, (avatar) => {
        setupPlayers[index].avatar = avatar;
        $("#avatar-modal").close();
      });
      $("#avatar-modal").showModal();
    },
    (index) => {
      if (setupPlayers.length <= 2) {
        showInfo("Минимум два игрока", "<p>Удалить можно, когда игроков больше двух.</p>");
        return;
      }
      setupPlayers.splice(index, 1);
      refreshSetup();
    }
  );
  const selectMap = (mapId) => {
    selectedMapId = mapId;
    renderMapCarousel(selectedMapId, selectMap);
  };
  renderMapCarousel(selectedMapId, selectMap);
}

function startGame(nextGame) {
  game = hydrateGame(nextGame);
  $("#start-screen").classList.add("hidden");
  $("#game-screen").classList.remove("hidden");
  $("#pause-overlay").classList.add("hidden");
  $("#game-window").classList.remove("paused");
  $("#hamburger-menu").classList.add("hidden");
  renderGame();
  saveCurrentGame(game);
  startTimer();
}

function renderGame() {
  const map = getMapById(game.mapId);
  $("#board-map").src = map.mapImage;
  $("#turn-title").textContent = getCurrentPlayer(game).name;
  $("#round-label").textContent = `Раунд ${game.round}`;
  renderBoardCells(map);
  renderTokens(game, map);
  renderLeaders(game, sortLeaders(game.players));
  setZoomMode("full");
}

async function handleRoll() {
  if (!game || isRolling || game.pausedAt) return;
  isRolling = true;
  $("#dice-button").disabled = true;
  const value = rollDice();
  game.lastRoll = value;
  $("#dice-caption").textContent = `${value}`;
  await animateDice($("#dice-cube"), value);
  await moveCurrentPlayer(value);
  if (hasWinner(game)) {
    finishGame();
    return;
  }
  advanceTurn(game);
  saveCurrentGame(game);
  renderGame();
  $("#dice-button").disabled = false;
  isRolling = false;
}

async function moveCurrentPlayer(steps) {
  const map = getMapById(game.mapId);
  const player = getCurrentPlayer(game);
  for (let step = 0; step < steps; step += 1) {
    player.position = clampPosition(map, player.position + 1);
    player.score += 1;
    renderTokens(game, map);
    hopCurrentToken();
    await wait(260);
  }
  const effect = getCellEffect(map, player.position);
  if (effect) {
    await wait(250);
    player.position = clampPosition(map, player.position + effect.steps);
    player.score += effect.type === "bonus" ? 3 : -2;
    renderTokens(game, map);
    hopCurrentToken();
    showInfo(effect.type === "bonus" ? "Бонус!" : "Ой, штраф", `<p>${player.name}: ${effect.steps > 0 ? "+" : ""}${effect.steps} клетки.</p>`);
  }
}

function hopCurrentToken() {
  const tokens = document.querySelectorAll(".player-token");
  const token = tokens[game.currentPlayerIndex];
  if (!token) return;
  token.classList.remove("hopping");
  void token.offsetWidth;
  token.classList.add("hopping");
}

function pauseGame() {
  if (!game || game.pausedAt) return;
  game.elapsedBeforePause += Date.now() - game.startedAt;
  game.startedAt = Date.now();
  game.pausedAt = Date.now();
  saveCurrentGame(game);
  $("#game-window").classList.add("paused");
  $("#pause-overlay").classList.remove("hidden");
}

function continueGame() {
  if (!game) return;
  game.pausedAt = null;
  game.startedAt = Date.now();
  saveCurrentGame(game);
  $("#game-window").classList.remove("paused");
  $("#pause-overlay").classList.add("hidden");
}

function finishGame() {
  const winner = getWinner(game);
  game.finishedAt = Date.now();
  saveResult({
    id: game.id,
    winner: winner.name,
    mapId: game.mapId,
    players: game.players.map(({ name, position, score }) => ({ name, position, score })),
    seconds: getElapsedSeconds(game),
    date: new Date().toISOString()
  });
  clearCurrentGame();
  showInfo("Победа!", `<p>${winner.name} добрался до финиша.</p><p>Время: ${formatTime(getElapsedSeconds(game))}</p>`);
  $("#dice-button").disabled = true;
  isRolling = false;
}

function handleMenuAction(event) {
  const action = event.target.dataset.menuAction;
  if (!action) return;
  $("#hamburger-menu").classList.add("hidden");
  if (action === "new") {
    clearCurrentGame();
    startGame(createGame({ players: setupPlayers, mapId: selectedMapId }));
  }
  if (action === "exit") {
    saveCurrentGame(game);
    stopTimer();
    $("#game-screen").classList.add("hidden");
    $("#start-screen").classList.remove("hidden");
    $("#resume-panel").classList.remove("hidden");
  }
  if (action === "about") {
    showInfo("MyChildGame", "<p>Ходите по карте, бросайте кубик и ловите бонусные клетки. Игра сохраняется автоматически на этом устройстве.</p>");
  }
  if (action === "results") {
    const results = loadResults();
    const html = results.length
      ? results
          .map((result) => `<div class="result-row"><span>${new Date(result.date).toLocaleDateString("ru-RU")} · ${result.winner}</span><strong>${formatTime(result.seconds)}</strong></div>`)
          .join("")
      : "<p>Пока нет завершенных игр.</p>";
    showInfo("Прошлые результаты", html);
  }
}

function startTimer() {
  stopTimer();
  timerId = window.setInterval(() => {
    if (!game || game.pausedAt) return;
    $("#timer-label").textContent = formatTime(getElapsedSeconds(game));
  }, 500);
}

function stopTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
}

function setZoomMode(mode) {
  document.querySelectorAll(".zoom-button").forEach((button) => button.classList.toggle("active", button.dataset.zoomMode === mode));
  if (mode === "full") zoom = 1;
  if (mode === "players") zoom = 1.35;
  $("#zoom-range").value = Math.round(zoom * 100);
  $("#board-layer").style.transform = `scale(${zoom})`;
}

function setupPinchZoom() {
  const viewport = $("#board-viewport");
  let distance = null;
  viewport.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length !== 2) return;
      event.preventDefault();
      const nextDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      if (distance) {
        zoom = Math.max(1, Math.min(2, zoom + (nextDistance - distance) / 280));
        setZoomMode("manual");
      }
      distance = nextDistance;
    },
    { passive: false }
  );
  viewport.addEventListener("touchend", () => {
    distance = null;
  });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

init();
