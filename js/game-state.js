import { getMapById } from "./board.js";
import { normalizePlayers } from "./players.js";

export function createGame({ players, mapId }) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
    mapId,
    players: normalizePlayers(players),
    currentPlayerIndex: 0,
    round: 1,
    startedAt: Date.now(),
    elapsedBeforePause: 0,
    pausedAt: null,
    finishedAt: null,
    lastRoll: null
  };
}

export function hydrateGame(game) {
  return {
    ...game,
    players: normalizePlayers(game.players || []),
    currentPlayerIndex: Number(game.currentPlayerIndex) || 0,
    round: Number(game.round) || 1,
    startedAt: Number(game.startedAt) || Date.now(),
    elapsedBeforePause: Number(game.elapsedBeforePause) || 0,
    pausedAt: game.pausedAt || null
  };
}

export function getCurrentPlayer(game) {
  return game.players[game.currentPlayerIndex];
}

export function advanceTurn(game) {
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  if (game.currentPlayerIndex === 0) game.round += 1;
  return game;
}

export function hasWinner(game) {
  const map = getMapById(game.mapId);
  return game.players.some((player) => player.position >= map.cells.length - 1);
}

export function getWinner(game) {
  return [...game.players].sort((a, b) => b.position - a.position || b.score - a.score)[0];
}

export function getElapsedSeconds(game) {
  const pausedExtra = game.pausedAt ? game.pausedAt - game.startedAt : Date.now() - game.startedAt;
  return Math.floor((game.elapsedBeforePause + pausedExtra) / 1000);
}
