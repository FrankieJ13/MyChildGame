import { MAPS, getCell } from "./board.js";
import { AVATARS } from "./players.js";

export const $ = (selector) => document.querySelector(selector);

export function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

export function renderPlayerSetup(players, onChange, onAvatar, onRemove) {
  const list = $("#player-setup-list");
  list.innerHTML = "";
  players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "player-row";
    row.innerHTML = `
      <button class="avatar-button" type="button" aria-label="Выбрать аватар">
        <img src="${player.avatar}" alt="">
      </button>
      <input value="${escapeHtml(player.name)}" maxlength="22" aria-label="Имя игрока ${index + 1}">
      <button class="remove-player" type="button" aria-label="Удалить игрока">×</button>
    `;
    row.querySelector(".avatar-button").addEventListener("click", () => onAvatar(index));
    row.querySelector("input").addEventListener("input", (event) => onChange(index, event.target.value));
    row.querySelector(".remove-player").addEventListener("click", () => onRemove(index));
    list.append(row);
  });
  $("#player-count-label").textContent = `${players.length} ${plural(players.length, ["игрок", "игрока", "игроков"])}`;
}

export function renderAvatarModal(activeAvatar, onPick) {
  const grid = $("#avatar-grid");
  grid.innerHTML = "";
  AVATARS.forEach((avatar) => {
    const button = document.createElement("button");
    button.className = `avatar-choice${avatar === activeAvatar ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `<img src="${avatar}" alt="Аватар">`;
    button.addEventListener("click", () => onPick(avatar));
    grid.append(button);
  });
}

export function renderMapCarousel(selectedMapId, onSelect) {
  const carousel = $("#map-carousel");
  carousel.innerHTML = "";
  MAPS.forEach((map) => {
    const button = document.createElement("button");
    button.className = `map-card${selectedMapId === map.id ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `<img src="${map.previewImage}" alt=""><span>${map.name}</span>`;
    button.addEventListener("click", () => onSelect(map.id));
    carousel.append(button);
  });
  $("#selected-map-label").textContent = MAPS.find((map) => map.id === selectedMapId)?.name || MAPS[0].name;
}

export function renderBoardCells(map) {
  const layer = $("#cell-layer");
  layer.innerHTML = "";
  map.cells.forEach((_, index) => {
    const cell = getCell(map, index);
    const marker = document.createElement("span");
    marker.className = "cell-marker";
    if (map.bonuses[index]) marker.classList.add("bonus");
    if (map.penalties[index]) marker.classList.add("penalty");
    marker.style.left = `${cell.x}%`;
    marker.style.top = `${cell.y}%`;
    layer.append(marker);
  });
}

export function renderTokens(game, map) {
  const layer = $("#token-layer");
  layer.innerHTML = "";
  game.players.forEach((player, index) => {
    const cell = getCell(map, player.position);
    const token = document.createElement("img");
    token.className = `player-token${index === game.currentPlayerIndex ? " current" : ""}`;
    token.src = player.avatar;
    token.alt = player.name;
    token.style.left = `${cell.x}%`;
    token.style.top = `${cell.y}%`;
    layer.append(token);
  });
}

export function renderLeaders(game, sortedPlayers) {
  const list = $("#leader-list");
  list.innerHTML = "";
  sortedPlayers.forEach((player) => {
    const current = player.id === game.players[game.currentPlayerIndex]?.id;
    const item = document.createElement("li");
    item.className = `leader-item${current ? " current" : ""}`;
    item.innerHTML = `
      <img src="${player.avatar}" alt="">
      <div>
        <div class="leader-name">${escapeHtml(player.name)}</div>
        <div class="leader-position">клетка ${player.position + 1}</div>
      </div>
      <strong>${player.score}</strong>
    `;
    list.append(item);
  });
}

export function showInfo(title, html) {
  $("#info-title").textContent = title;
  $("#info-content").innerHTML = html;
  $("#info-modal").showModal();
}

function plural(value, forms) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}
